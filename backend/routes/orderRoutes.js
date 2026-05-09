import express from "express";
import Order from "../models/Order.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// POST — place an order (logged-in user)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const order = await Order.create({
      ...req.body,
      userId: req.user.id,
    });
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json("Server error placing order");
  }
});

// GET — logged-in user's own orders
router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json("Server error fetching orders");
  }
});

// GET — all orders (admin)
router.get("/all", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json("Server error fetching all orders");
  }
});

// PATCH — update order status (admin)
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json("Invalid status value");
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json("Order not found");
    res.json(order);
  } catch (error) {
    res.status(500).json("Server error updating order status");
  }
});

export default router;