const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

const BillingInfoSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zipCode: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
    default: "USA",
  },
});

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [OrderItemSchema],
  billingInfo: BillingInfoSchema,
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "Pending",
    enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate a unique order number before saving
OrderSchema.pre("save", async function (next) {
  console.log("Generating order number...", this.orderNumber); // Debugging line

  if (!this.orderNumber) {
    // Generate order number in format: ORD-YYMMDD-XXXX (year-month-day-random number)
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    const random = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber = `ORD-${year}${month}${day}-${random}`;
  }
  next();
});

module.exports = mongoose.model("Order", OrderSchema);
