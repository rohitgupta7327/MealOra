import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User, getDBStatus } from "../../Database/index.js";
import { signToken } from "../middleware/auth.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";

// In-memory fallback repository when MongoDB server is not running locally
const inMemoryUsers = new Map();

// Helper to hash password
async function hashPassword(plainText) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainText, salt);
}

/**
 * Seed default accounts (Admin and Staff)
 */
export async function seedDefaultUsers() {
  const defaultAccounts = [
    {
      name: "Mealora",
      email: "admin@mealora.com",
      password: "admin123",
      role: "admin",
      avatar: "JD",
    },
  ];

  const dbConnected = mongoose.connection.readyState === 1;

  if (dbConnected) {
    try {
      for (const acc of defaultAccounts) {
        const existing = await User.findOne({ email: acc.email.toLowerCase() });
        if (!existing) {
          const user = new User(acc);
          await user.save();
          console.log(`🌱 [Seed] MongoDB created default account: ${acc.email} (${acc.role})`);
        }
      }
    } catch (err) {
      console.error("⚠️ [Seed Error in MongoDB]:", err.message);
    }
  }

  // Also populate in-memory fallback store with hashed passwords
  for (const acc of defaultAccounts) {
    if (!inMemoryUsers.has(acc.email.toLowerCase())) {
      const hashedPassword = await hashPassword(acc.password);
      inMemoryUsers.set(acc.email.toLowerCase(), {
        id: "mem_" + Math.random().toString(36).substring(2, 9),
        name: acc.name,
        email: acc.email.toLowerCase(),
        password: hashedPassword, // Stored as bcrypt hash
        role: acc.role,
        avatar: acc.avatar,
        createdAt: new Date(),
      });
    }
  }
}

/**
 * Register a new user
 * POST /api/auth/register
 */
export async function register(req, res) {
  try {
    const { name, email, password, role = "staff" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, email, password.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const assignedRole = role === "admin" ? "admin" : "staff";
    const dbConnected = mongoose.connection.readyState === 1;

    if (dbConnected) {
      // 1. Check if user already exists in MongoDB
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "An account with this email address already exists.",
        });
      }

      // 2. Create and save user to MongoDB (password is automatically hashed via Mongoose pre-save hook)
      const newUser = new User({
        name: name.trim(),
        email: normalizedEmail,
        password, // Pre-save hook hashes with bcrypt
        role: assignedRole,
      });

      await newUser.save();
      const token = signToken(newUser);

      return res.status(201).json({
        success: true,
        message: "Account created successfully in MongoDB.",
        token,
        storage: "mongodb",
        user: newUser.toSafeObject(),
      });
    } else {
      // Fallback mode if MongoDB is not running
      if (inMemoryUsers.has(normalizedEmail)) {
        return res.status(409).json({
          success: false,
          message: "An account with this email address already exists.",
        });
      }

      const hashedPassword = await hashPassword(password);
      const userObj = {
        id: "mem_" + Math.random().toString(36).substring(2, 9),
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: assignedRole,
        avatar: name.slice(0, 2).toUpperCase(),
        createdAt: new Date(),
      };

      inMemoryUsers.set(normalizedEmail, userObj);
      const token = signToken(userObj);

      return res.status(201).json({
        success: true,
        message: "Account created successfully (Memory safe mode).",
        token,
        storage: "memory",
        user: {
          id: userObj.id,
          name: userObj.name,
          email: userObj.email,
          role: userObj.role,
          avatar: userObj.avatar,
          createdAt: userObj.createdAt,
        },
      });
    }
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during registration: " + error.message,
    });
  }
}

/**
 * Login user
 * POST /api/auth/login
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const dbConnected = mongoose.connection.readyState === 1;

    let user = null;
    let isPasswordValid = false;
    let storageType = "mongodb";

    if (dbConnected) {
      // Find in MongoDB
      user = await User.findOne({ email: normalizedEmail });

      if (user) {
        // Verify password hash with bcrypt
        isPasswordValid = await user.comparePassword(password);
      }
    }

    // If not found in MongoDB or DB not connected, check in-memory store
    if (!user && inMemoryUsers.has(normalizedEmail)) {
      const memUser = inMemoryUsers.get(normalizedEmail);
      isPasswordValid = await bcrypt.compare(password, memUser.password);
      if (isPasswordValid) {
        user = memUser;
        storageType = "memory";
      }
    }

    if (!user || !isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Please verify your email and password.",
      });
    }

    // Reset failed authentication counter for this IP upon successful login
    const clientIp =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "127.0.0.1";
    authRateLimiter.reset(clientIp);

    // Sign JWT token
    const token = signToken(user);

    const safeUser = {
      id: user._id ? user._id.toString() : user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || user.name.slice(0, 2).toUpperCase(),
    };

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      storage: storageType,
      user: safeUser,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login: " + error.message,
    });
  }
}

/**
 * Get current authenticated user details
 * GET /api/auth/me
 */
export async function getMe(req, res) {
  try {
    const { id, email } = req.user;
    const dbConnected = mongoose.connection.readyState === 1;

    if (dbConnected) {
      const user = await User.findById(id).select("-password");
      if (user) {
        return res.json({
          success: true,
          user: user.toSafeObject(),
          storage: "mongodb",
        });
      }
    }

    if (inMemoryUsers.has(email.toLowerCase())) {
      const memUser = inMemoryUsers.get(email.toLowerCase());
      return res.json({
        success: true,
        user: {
          id: memUser.id,
          name: memUser.name,
          email: memUser.email,
          role: memUser.role,
          avatar: memUser.avatar,
        },
        storage: "memory",
      });
    }

    // Return payload from valid JWT if not found in cache
    return res.json({
      success: true,
      user: req.user,
      storage: dbConnected ? "mongodb" : "token",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching user profile: " + error.message,
    });
  }
}

/**
 * Health & MongoDB Connection Status Endpoint
 * GET /api/auth/status
 */
export function getStatus(req, res) {
  const dbStatus = getDBStatus();
  return res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    mongodb: {
      connected: dbStatus.isConnected,
      readyState: dbStatus.readyState,
      host: dbStatus.host,
      database: dbStatus.name,
      uri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mealora",
    },
    auth: {
      jwtEnabled: true,
      hashingAlgorithm: "bcrypt",
      saltRounds: 10,
    },
  });
}

/**
 * Get all team members (Admin Only)
 * GET /api/auth/members
 */
export async function getMembers(req, res) {
  try {
    const dbConnected = mongoose.connection.readyState === 1;
    if (dbConnected) {
      const users = await User.find().select("-password").sort({ createdAt: -1 });
      return res.json({
        success: true,
        members: users.map((u) => u.toSafeObject()),
      });
    }

    const members = Array.from(inMemoryUsers.values()).map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatar: u.avatar,
      createdAt: u.createdAt,
    }));
    return res.json({ success: true, members });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Add a new team member as Admin or Staff (Admin Only)
 * POST /api/auth/members
 */
export async function addMember(req, res) {
  try {
    const { name, email, password, role = "staff" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide full name, email address, and temporary password.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const assignedRole = role === "admin" ? "admin" : "staff";
    const dbConnected = mongoose.connection.readyState === 1;

    if (dbConnected) {
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "A user with this email address already exists in MongoDB.",
        });
      }

      const newUser = new User({
        name: name.trim(),
        email: normalizedEmail,
        password, // Mongoose hook hashes with bcrypt automatically
        role: assignedRole,
      });

      await newUser.save();

      return res.status(201).json({
        success: true,
        message: `Successfully created ${assignedRole} account for ${newUser.name}.`,
        member: newUser.toSafeObject(),
      });
    } else {
      if (inMemoryUsers.has(normalizedEmail)) {
        return res.status(409).json({
          success: false,
          message: "A user with this email already exists.",
        });
      }

      const hashedPassword = await hashPassword(password);
      const userObj = {
        id: "mem_" + Math.random().toString(36).substring(2, 9),
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: assignedRole,
        avatar: name.slice(0, 2).toUpperCase(),
        createdAt: new Date(),
      };

      inMemoryUsers.set(normalizedEmail, userObj);

      return res.status(201).json({
        success: true,
        message: `Successfully created ${assignedRole} account for ${userObj.name}.`,
        member: {
          id: userObj.id,
          name: userObj.name,
          email: userObj.email,
          role: userObj.role,
          avatar: userObj.avatar,
          createdAt: userObj.createdAt,
        },
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Delete a team member (Admin Only)
 * DELETE /api/auth/members/:id
 */
export async function deleteMember(req, res) {
  try {
    const { id } = req.params;

    if (req.user && req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own active administrator account.",
      });
    }

    const dbConnected = mongoose.connection.readyState === 1;
    if (dbConnected) {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ success: false, message: "Member not found." });
      }

      if (user.email === "admin@mealora.com") {
        return res.status(400).json({
          success: false,
          message: "The primary predefined owner account cannot be deleted.",
        });
      }

      await User.findByIdAndDelete(id);
      return res.json({ success: true, message: "Member removed successfully." });
    }

    return res.json({ success: true, message: "Member removed." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

