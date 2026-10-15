import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Dish name is required"],
      trim: true,
      maxlength: 120,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Burgers", "Mains", "Sides", "Desserts", "Drinks", "Specials"],
      default: "Mains",
      index: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
    image: {
      type: String,
      default: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
    },
    inStock: {
      type: Boolean,
      default: true,
      index: true,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    prepTime: {
      type: String,
      default: "12 min",
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.itemId || ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.itemId || ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// High-speed compound indexes for POS search and category filtering
menuItemSchema.index({ category: 1, inStock: 1 });
menuItemSchema.index({ name: 1 });

const MenuItem = mongoose.model("MenuItem", menuItemSchema);

export default MenuItem;
