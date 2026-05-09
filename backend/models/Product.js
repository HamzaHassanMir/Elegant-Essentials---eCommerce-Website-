import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, "Product name is required"],
      trim:     true,
    },
    price: {
      type:     Number,
      required: [true, "Price is required"],
      min:      [0, "Price cannot be negative"],
    },
    description: {
      type:    String,
      trim:    true,
      default: "",
    },
    image: {
      type:    String,
      default: "",
    },
    stock: {
      type:    Number,
      default: 0,
      min:     0,
    },
    category: {
      type:    String,
      trim:    true,
      default: "Uncategorized",
    },
    // ── Sale fields ───────────────────────────────────────────────────────────
    onSale: {
      type:    Boolean,
      default: false,
    },
    salePercent: {
      type:    Number,
      default: 0,
      min:     0,
      max:     100,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);