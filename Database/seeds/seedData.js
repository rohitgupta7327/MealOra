import { connectDB, User, Order } from "../index.js";

/**
 * Seed script to populate or reset MongoDB Atlas defaults
 */
export async function seedDatabase() {
  await connectDB();

  // Ensure default owner account exists
  const existingAdmin = await User.findOne({ email: "admin@mealora.com" });
  if (!existingAdmin) {
    const adminUser = new User({
      name: "Mealora Admin",
      email: "admin@mealora.com",
      password: "admin123",
      role: "admin",
      avatar: "AD",
    });
    await adminUser.save();
    console.log(" [Database Seed] Seeded default owner: admin@mealora.com");
  } else {
    console.log("ℹ [Database Seed] Owner account already present.");
  }
}

// Allow direct execution: `node Database/seeds/seedData.js`
if (process.argv[1] && process.argv[1].endsWith("seedData.js")) {
  seedDatabase().then(() => {
    console.log("✨ Database seed process complete.");
    process.exit(0);
  }).catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
}
