const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Public routes
// Register new user
router.post('/register', userController.registerUser);

// Login user
router.post('/login', userController.loginUser);

// Get user profile
router.get('/profile/:id', userController.getUserProfile);

// Update user profile
router.put('/profile/:id', userController.updateUserProfile);

// Admin routes
// Get all users (admin only)
router.get('/', userController.getAllUsers);

// Update user (admin only)
router.put('/:id', userController.updateUser);

// Delete user (admin only)
router.delete('/:id', userController.deleteUser);

// Get user stats (admin only)
router.get('/stats', userController.getUserStats);

module.exports = router;