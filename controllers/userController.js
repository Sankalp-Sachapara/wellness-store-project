const User = require("../models/User");

// Register new user
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const newUser = new User({
      username,
      email,
      password,
    });

    await newUser.save();

    // Don't send password back
    const userResponse = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
    };

    res.status(201).json(userResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(`Login attempt with email: ${email}`);

    // Find user by email
    const user = await User.findOne({ email });

    console.log(`User found: ${user}`);

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    console.log(`Password match: ${isMatch}`);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Don't send password back
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    res.status(200).json(userResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    // Don't send password back
    const userResponse = {
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    };

    res.status(200).json(userResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user (admin only)
exports.updateUser = async (req, res) => {
  try {
    const { username, email, isAdmin } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Update fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (isAdmin !== undefined) user.isAdmin = isAdmin;
    
    // Handle password change separately
    if (req.body.password) {
      user.password = req.body.password;
    }
    
    const updatedUser = await user.save();
    
    res.status(200).json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      createdAt: updatedUser.createdAt
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user stats (admin only)
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ isAdmin: true });
    const regularUsers = await User.countDocuments({ isAdmin: false });
    
    // Get recently joined users (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    
    res.status(200).json({
      totalUsers,
      adminUsers,
      regularUsers,
      recentUsers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
