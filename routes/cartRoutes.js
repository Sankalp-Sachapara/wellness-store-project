const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Get all carts (admin only)
router.get('/', cartController.getAllCarts);

// Get user's cart
router.get('/:userId', cartController.getCart);

// Add item to cart
router.post('/:userId/add', cartController.addToCart);

// Update cart item quantity
router.put('/:userId/items/:itemId', cartController.updateCartItem);

// Remove item from cart
router.delete('/:userId/items/:itemId', cartController.removeFromCart);

// Clear cart
router.delete('/:userId/clear', cartController.clearCart);

module.exports = router;