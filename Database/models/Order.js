import mongoose from "mongoose";

/**
 * Highly optimized sub-schema for Order Items.
 * _id: false prevents Mongoose from allocating 12-byte ObjectIds and wrapper
 * documents for every cart item, reducing memory footprint by ~60%.
 */
const orderItemSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

/**
 * Order Schema with optimized indexing strategy.
 * Includes composite index for high-speed queries on status and recency.
 */
const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    customer: {
      type: String,
      required: true,
      trim: true,
      default: "Dine-In • Guest",
    },
    type: {
      type: String,
      enum: ["Dine-In", "Takeaway"],
      default: "Dine-In",
    },
    items: {
      type: [orderItemSchema],
      validate: [(val) => val.length > 0, "Order must have at least one item."],
    },
    itemsCount: {
      type: Number,
      required: true,
      min: 1,
    },
    itemsSummary: {
      type: String,
      required: true,
    },
    // Server-Calculated Authoritative Billing Fields
    subtotal: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    discountAmount: { type: Number, default: 0, min: 0 },
    taxableAmount: { type: Number, required: true, min: 0 },
    taxRate: { type: Number, default: 0.05, min: 0 },
    tax: { type: Number, required: true, min: 0 },
    finalTotal: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["Pending", "Preparing", "Ready", "Completed"],
      default: "Pending",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "UPI", "Credit Card", "Apple Pay", "Pending"],
      default: "Cash",
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Unpaid", "Refunded"],
      default: "Paid",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false, // Disables __v field to save storage and network bandwidth
  }
);

// High-performance compound index for Kitchen KDS and Recent Orders queries (O(log N))
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });

// Fast transformer for lean objects
orderSchema.methods.toSafeObject = function () {
  return {
    id: this.orderNumber,
    _id: this._id,
    orderNumber: this.orderNumber,
    customer: this.customer,
    type: this.type,
    items: this.items,
    itemsCount: this.itemsCount,
    itemsSummary: this.itemsSummary,
    subtotal: this.subtotal,
    discountPercent: this.discountPercent,
    discountAmount: this.discountAmount,
    taxableAmount: this.taxableAmount,
    taxRate: this.taxRate,
    tax: this.tax,
    finalTotal: this.finalTotal,
    total: this.finalTotal,
    status: this.status,
    paymentMethod: this.paymentMethod,
    paymentStatus: this.paymentStatus,
    notes: this.notes,
    createdAt: this.createdAt,
    time: "Just now",
  };
};

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
