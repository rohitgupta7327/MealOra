/**
 * Database Module - Unified Entry Point
 * Exposes database connection, health status, and Mongoose models
 */
export { connectDB, getDBStatus } from "./db.js";
export { default as User } from "./models/User.js";
export { default as Order } from "./models/Order.js";
export { default as MenuItem } from "./models/MenuItem.js";
