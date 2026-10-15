import mongoose from "mongoose";
import dns from "node:dns";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, ".env") });

// Fix for Windows & ISP DNS failing to resolve MongoDB Atlas SRV records (ECONNREFUSED _mongodb._tcp)
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  console.warn("DNS fallback to system resolver");
}

let isConnected = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mealora";

  try {
    mongoose.set("strictQuery", true);

    await mongoose.connect(uri, {
      dbName: "mealora",
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    });

    isConnected = true;
    console.log(`✅ [MongoDB] Successfully connected to: ${mongoose.connection.host}/${mongoose.connection.name}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.warn(` [MongoDB] Connection error: ${error.message}`);
    console.warn(` [MongoDB] Tip: Ensure MongoDB is running locally on port 27017 or update MONGODB_URI in .env (e.g., MongoDB Atlas connection string).`);
    return false;
  }
}

export function getDBStatus() {
  return {
    isConnected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState, // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  };
}
