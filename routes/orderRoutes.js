const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// Create a new order (checkout)
router.post("/:userId", orderController.createOrder);

// Get user's orders
router.get("/user/:userId", orderController.getUserOrders);

// Get single order
router.get("/:orderId", orderController.getOrderById);

// Cancel order
router.put("/:orderId/cancel", orderController.cancelOrder);

// Get all orders (admin only)
router.get("/", orderController.getAllOrders);

// Update order status (admin only)
router.put("/:orderId/status", orderController.updateOrderStatus);

module.exports = router;
