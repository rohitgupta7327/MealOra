import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { MenuItem } from "../../Database/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * GET /api/menu
 * Retrieve all culinary items from MongoDB Atlas
 */
export async function getMenuItems(req, res) {
  try {
    const items = await MenuItem.find().sort({ itemId: 1 }).lean().exec();

    // Standardize object format with numeric id
    const formatted = items.map((item) => ({
      ...item,
      id: item.itemId,
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      items: formatted,
    });
  } catch (err) {
    console.error("Error fetching menu items:", err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve menu items from database.",
    });
  }
}

/**
 * POST /api/menu
 * Create a new dish in MongoDB Atlas with uploaded image saved on backend
 * (Admin Only)
 */
export async function createMenuItem(req, res) {
  try {
    const { name, category, price, description, prepTime, inStock } = req.body;

    if (!name || price === undefined || price === null || price === "") {
      return res.status(400).json({
        success: false,
        message: "Dish name and price are required.",
      });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid price value.",
      });
    }

    // Determine image URL:
    // If a file was uploaded, save relative path to /uploads/<filename>
    let imageUrl =
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80";

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.image && typeof req.body.image === "string" && req.body.image.trim()) {
      imageUrl = req.body.image.trim();
    }

    // Generate atomic next sequential itemId
    const highestItem = await MenuItem.findOne()
      .sort({ itemId: -1 })
      .select("itemId")
      .lean()
      .exec();
    const nextItemId = highestItem && highestItem.itemId ? highestItem.itemId + 1 : 13;

    const newDish = new MenuItem({
      itemId: nextItemId,
      name: name.trim(),
      category: category || "Mains",
      price: parsedPrice,
      description: description ? description.trim() : "",
      image: imageUrl,
      inStock: inStock === "false" || inStock === false ? false : true,
      rating: 5.0,
      prepTime: prepTime ? prepTime.trim() : "12 min",
    });

    const savedDish = await newDish.save();

    console.log(`✨ [Menu] New dish created: #${savedDish.itemId} "${savedDish.name}" ($${savedDish.price})`);

    const formatted = {
      ...savedDish.toObject(),
      id: savedDish.itemId,
    };

    res.status(201).json({
      success: true,
      message: `Dish "${savedDish.name}" added successfully to database!`,
      item: formatted,
    });
  } catch (err) {
    console.error("Error creating menu item:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to create menu item.",
    });
  }
}

/**
 * PUT /api/menu/:id
 * Update an existing dish in MongoDB Atlas (Admin Only)
 */
export async function updateMenuItem(req, res) {
  try {
    const rawId = req.params.id;
    const numericId = parseInt(rawId, 10);
    const filter = !isNaN(numericId) ? { itemId: numericId } : { _id: rawId };

    const dish = await MenuItem.findOne(filter);
    if (!dish) {
      return res.status(404).json({
        success: false,
        message: "Dish not found.",
      });
    }

    const { name, category, price, description, prepTime, inStock } = req.body;

    if (name) dish.name = name.trim();
    if (category) dish.category = category;
    if (price !== undefined && price !== "") {
      const parsedPrice = parseFloat(price);
      if (!isNaN(parsedPrice) && parsedPrice >= 0) {
        dish.price = parsedPrice;
      }
    }
    if (description !== undefined) dish.description = description.trim();
    if (prepTime) dish.prepTime = prepTime.trim();
    if (inStock !== undefined) {
      dish.inStock = inStock === "true" || inStock === true;
    }

    // If new image was uploaded, update image path
    if (req.file) {
      dish.image = `/uploads/${req.file.filename}`;
    } else if (req.body.image && typeof req.body.image === "string" && req.body.image.trim()) {
      dish.image = req.body.image.trim();
    }

    const updated = await dish.save();

    res.status(200).json({
      success: true,
      message: `Dish "${updated.name}" updated successfully.`,
      item: {
        ...updated.toObject(),
        id: updated.itemId,
      },
    });
  } catch (err) {
    console.error("Error updating menu item:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update menu item.",
    });
  }
}

/**
 * PATCH /api/menu/:id/stock
 * Toggle dish stock status in MongoDB Atlas (Admin Only)
 */
export async function toggleStock(req, res) {
  try {
    const rawId = req.params.id;
    const numericId = parseInt(rawId, 10);
    const filter = !isNaN(numericId) ? { itemId: numericId } : { _id: rawId };

    const dish = await MenuItem.findOne(filter);
    if (!dish) {
      return res.status(404).json({
        success: false,
        message: "Dish not found.",
      });
    }

    dish.inStock = !dish.inStock;
    await dish.save();

    res.status(200).json({
      success: true,
      message: `"${dish.name}" stock is now ${dish.inStock ? "IN STOCK" : "OUT OF STOCK"}`,
      item: {
        ...dish.toObject(),
        id: dish.itemId,
      },
    });
  } catch (err) {
    console.error("Error toggling stock:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update stock status.",
    });
  }
}

/**
 * DELETE /api/menu/:id
 * Remove dish from MongoDB Atlas (Admin Only)
 */
export async function deleteMenuItem(req, res) {
  try {
    const rawId = req.params.id;
    const numericId = parseInt(rawId, 10);
    const filter = !isNaN(numericId) ? { itemId: numericId } : { _id: rawId };

    const dish = await MenuItem.findOneAndDelete(filter);
    if (!dish) {
      return res.status(404).json({
        success: false,
        message: "Dish not found.",
      });
    }

    // Clean up local uploaded file if exists
    if (dish.image && dish.image.startsWith("/uploads/")) {
      const filePath = path.resolve(__dirname, "..", dish.image.replace(/^\//, ""));
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch {
          // non-blocking
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Dish "${dish.name}" removed from database.`,
    });
  } catch (err) {
    console.error("Error deleting menu item:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete dish.",
    });
  }
}
