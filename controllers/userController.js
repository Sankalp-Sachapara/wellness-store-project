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
    console.log(`Login attempt with password: ${password}`);

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
