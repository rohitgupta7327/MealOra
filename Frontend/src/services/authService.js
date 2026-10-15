/**
 * Authentication Service for Mealora
 * Provides clean, fast, and optimized tab-isolated session management:
 * 1. Opening a new tab does NOT auto-login (each new tab opens at /login).
 * 2. If Admin is already logged in on one tab, and another tab logs in as Staff,
 *    reloading that tab cleanly restores the active Admin session and opens the Admin page.
 * 3. Eliminates all bloated cross-tab broadcast listeners for maximum performance.
 */

const TOKEN_KEY = "mealora_token";
const USER_KEY = "mealora_user";
const ADMIN_SESSION_KEY = "mealora_active_admin";
const CONVERTED_FLAG = "mealora_converted_to_admin";

// Clear legacy keys from older versions to prevent stale state
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem("mealora_token");
    localStorage.removeItem("mealora_user");
  } catch {
    // ignore
  }
}

export const authService = {
  /**
   * On reload, check if this tab held a staff session while an admin was already logged in.
   * If so, convert back to the active admin session upon reload.
   */
  _syncReloadAdmin() {
    try {
      const userStr = sessionStorage.getItem(USER_KEY);
      if (userStr) {
        const user = JSON.parse(userStr);
        // Only convert if this tab was staff and an admin session is active in the browser
        if (user && user.role !== "admin") {
          const adminRaw = localStorage.getItem(ADMIN_SESSION_KEY);
          if (adminRaw) {
            const adminData = JSON.parse(adminRaw);
            if (adminData?.token && adminData?.user?.role === "admin") {
              sessionStorage.setItem(TOKEN_KEY, adminData.token);
              sessionStorage.setItem(USER_KEY, JSON.stringify(adminData.user));
              sessionStorage.setItem(CONVERTED_FLAG, "true");
              return adminData.user;
            }
          }
        }
      }
    } catch {
      // ignore
    }
    return null;
  },

  /**
   * Check if this tab was just converted to admin on reload
   */
  checkAndClearConvertedFlag() {
    try {
      const isConverted = sessionStorage.getItem(CONVERTED_FLAG) === "true";
      if (isConverted) {
        sessionStorage.removeItem(CONVERTED_FLAG);
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  },

  /**
   * Get stored JWT token
   */
  getToken() {
    try {
      this._syncReloadAdmin();
      return sessionStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  /**
   * Get currently stored user profile
   */
  getUser() {
    try {
      this._syncReloadAdmin();
      const data = sessionStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  /**
   * Save session data into tab's sessionStorage
   * If role is admin, also register it in localStorage as the active admin session
   */
  setSession(token, user) {
    try {
      if (token) sessionStorage.setItem(TOKEN_KEY, token);
      if (user) sessionStorage.setItem(USER_KEY, JSON.stringify(user));

      if (user?.role === "admin" && token) {
        localStorage.setItem(
          ADMIN_SESSION_KEY,
          JSON.stringify({ token, user, timestamp: Date.now() })
        );
      }
    } catch (e) {
      console.warn("Session storage error", e);
    }
  },

  /**
   * Clear session on logout
   */
  logout() {
    try {
      const user = this.getUser();
      if (user?.role === "admin") {
        localStorage.removeItem(ADMIN_SESSION_KEY);
      }
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(CONVERTED_FLAG);
    } catch (e) {
      console.warn("Logout clear error", e);
    }
  },

  /**
   * Perform user login with email and password
   */
  async login(email, password) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Login failed. Please check your credentials.");
    }

    this.setSession(data.token, data.user);
    return data;
  },

  /**
   * Register a new user in MongoDB with bcrypt hashed password
   */
  async register(name, email, password, role = "staff") {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Registration failed.");
    }

    this.setSession(data.token, data.user);
    return data;
  },

  /**
   * Verify token validity against the backend
   */
  async verifySession() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        this.logout();
        return null;
      }

      const data = await res.json();
      if (data.success && data.user) {
        this.setSession(token, data.user);
        return data.user;
      }
      return null;
    } catch {
      return this.getUser();
    }
  },

  /**
   * Fetch backend & MongoDB status
   */
  async getSystemStatus() {
    try {
      const res = await fetch("/api/auth/status");
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /**
   * Get all registered members (Admin Only)
   */
  async getMembers() {
    const token = this.getToken();
    const res = await fetch("/api/auth/members", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to load team members.");
    }
    return data.members || [];
  },

  /**
   * Add a new member as Admin or Staff (Admin Only)
   */
  async addMember(memberData) {
    const token = this.getToken();
    const res = await fetch("/api/auth/members", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(memberData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to create team member.");
    }
    return data;
  },

  /**
   * Delete a member (Admin Only)
   */
  async deleteMember(id) {
    const token = this.getToken();
    const res = await fetch(`/api/auth/members/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to delete member.");
    }
    return data;
  },
};

export default authService;
