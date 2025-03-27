const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Register new user
router.post('/register', userController.registerUser);

// Login user
router.post('/login', userController.loginUser);

// Get user profile
router.get('/profile/:id', userController.getUserProfile);

// Update user profile
router.put('/profile/:id', userController.updateUserProfile);

module.exports = router;