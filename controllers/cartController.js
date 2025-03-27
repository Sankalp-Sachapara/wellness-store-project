const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    let cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      // Create new cart if none exists
      cart = new Cart({
        user: userId,
        items: [],
        totalAmount: 0
      });
      await cart.save();
    }
    
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { productId, quantity } = req.body;
    
    // Validate quantity
    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than zero' });
    }
    
    // Find or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
        totalAmount: 0
      });
    }
    
    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if product is in stock
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }
    
    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );
    
    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
        name: product.name,
        imageUrl: product.imageUrl
      });
    }
    
    // Calculate total amount
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );
    
    await cart.save();
    
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.params.userId;
    const itemId = req.params.itemId;
    const { quantity } = req.body;
    
    // Validate quantity
    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than zero' });
    }
    
    // Find cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    // Find item in cart
    const itemIndex = cart.items.findIndex(
      item => item._id.toString() === itemId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    // Check if product has enough stock
    const productId = cart.items[itemIndex].product;
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }
    
    // Update quantity
    cart.items[itemIndex].quantity = quantity;
    
    // Recalculate total amount
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );
    
    await cart.save();
    
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    const itemId = req.params.itemId;
    
    // Find cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    // Remove item
    cart.items = cart.items.filter(
      item => item._id.toString() !== itemId
    );
    
    // Recalculate total amount
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );
    
    await cart.save();
    
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Find cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    // Clear items and reset total
    cart.items = [];
    cart.totalAmount = 0;
    
    await cart.save();
    
    res.status(200).json({ message: 'Cart cleared successfully', cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
