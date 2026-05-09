import express from "express";
import Product from "../models/Product.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all products (public)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json("Server error fetching products");
  }
});

// GET single product (public)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json("Product not found");
    res.json(product);
  } catch (error) {
    res.status(500).json("Server error fetching product");
  }
});

// POST create product (protected)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json("Server error creating product");
  }
});

// PUT update product (protected)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json("Product not found");
    res.json(product);
  } catch (error) {
    res.status(500).json("Server error updating product");
  }
});

// DELETE product (protected)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json("Product not found");
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json("Server error deleting product");
  }
});

export default router;