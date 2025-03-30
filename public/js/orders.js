// orders.js - My Orders Page Functionality
document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const ordersList = document.getElementById("orders-list");
  const noOrdersMessage = document.getElementById("no-orders");
  const modal = document.getElementById("order-detail-modal");
  const modalContent = document.getElementById("order-detail-content");
  const closeBtn = document.querySelector(".close");

  // Check authentication
  const user = checkAuthStatus();

  if (!user) {
    window.location.href = "login.html?redirect=orders.html";
    return;
  }

  // Fetch and display orders
  fetchOrders();

  // Close modal when clicking X
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  // Fetch user's orders
  async function fetchOrders() {
    try {
      const response = await fetch(`${API_URL}/orders/user/${user._id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const orders = await response.json();

      console.log("Fetched Orders:", orders); // Debugging line

      if (!orders || orders.length === 0) {
        showNoOrdersMessage();
      } else {
        displayOrders(orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      ordersList.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          <p>Failed to load orders. Please try again later.</p>
          <button class="btn btn-primary" onclick="window.location.reload()">Retry</button>
        </div>
      `;
    }
  }

  // Display no orders message
  function showNoOrdersMessage() {
    ordersList.style.display = "none";
    noOrdersMessage.style.display = "block";
  }

  // Display orders list
  function displayOrders(orders) {
    ordersList.innerHTML = `
      <div class="orders-table">
        <div class="orders-header">
          <div class="order-col">Order #</div>
          <div class="order-col">Date</div>
          <div class="order-col">Items</div>
          <div class="order-col">Total</div>
          <div class="order-col">Status</div>
          <div class="order-col">Actions</div>
        </div>
        <div class="orders-body">
          ${orders.map((order) => createOrderRow(order)).join("")}
        </div>
      </div>
    `;

    // Add event listeners to view buttons
    document.querySelectorAll(".view-order-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const orderId = e.target.dataset.orderId;
        showOrderDetails(orderId);
      });
    });
  }

  // Create HTML for an order row
  function createOrderRow(order) {
    const orderDate = new Date(order.createdAt).toLocaleDateString();
    const statusClass = getStatusClass(order.status);

    return `
      <div class="order-row">
        <div class="order-col">${order.orderNumber}</div>
        <div class="order-col">${orderDate}</div>
        <div class="order-col">${order.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        )}</div>
        <div class="order-col">${formatPrice(order.totalAmount)}</div>
        <div class="order-col ${statusClass}">${order.status}</div>
        <div class="order-col">
          <button class="btn btn-sm view-order-btn" data-order-id="${
            order._id
          }">
            View Details
          </button>
        </div>
      </div>
    `;
  }

  // Show order details in modal
  async function showOrderDetails(orderId) {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch order details");
      }

      const order = await response.json();
      modalContent.innerHTML = createOrderDetailsHTML(order);
      modal.style.display = "block";
    } catch (error) {
      console.error("Error fetching order details:", error);
      modalContent.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          <p>Failed to load order details. Please try again later.</p>
        </div>
      `;
      modal.style.display = "block";
    }
  }

  // Create HTML for order details
  function createOrderDetailsHTML(order) {
    const orderDate = new Date(order.createdAt).toLocaleString();
    const statusClass = getStatusClass(order.status);

    return `
      <div class="order-details">
        <div class="order-detail-row">
          <div class="detail-label">Order Number:</div>
          <div class="detail-value">${order.orderNumber}</div>
        </div>
        <div class="order-detail-row">
          <div class="detail-label">Date:</div>
          <div class="detail-value">${orderDate}</div>
        </div>
        <div class="order-detail-row">
          <div class="detail-label">Status:</div>
          <div class="detail-value ${statusClass}">${order.status}</div>
        </div>
        
        <h3>Billing Information</h3>
        <div class="billing-info">
          <div class="order-detail-row">
            <div class="detail-label">Name:</div>
            <div class="detail-value">${order.billingInfo.firstName} ${
      order.billingInfo.lastName
    }</div>
          </div>
          <div class="order-detail-row">
            <div class="detail-label">Email:</div>
            <div class="detail-value">${order.billingInfo.email}</div>
          </div>
          <div class="order-detail-row">
            <div class="detail-label">Address:</div>
            <div class="detail-value">${order.billingInfo.address}, ${
      order.billingInfo.city
    }, ${order.billingInfo.state} ${order.billingInfo.zipCode}</div>
          </div>
        </div>
        
        <h3>Order Items</h3>
        <div class="order-items">
          ${order.items.map((item) => createOrderItemHTML(item)).join("")}
        </div>
        
        <div class="order-summary">
          <div class="summary-row">
            <div class="summary-label">Subtotal:</div>
            <div class="summary-value">${formatPrice(order.totalAmount)}</div>
          </div>
          <div class="summary-row">
            <div class="summary-label">Shipping:</div>
            <div class="summary-value">${formatPrice(order.shipping || 0)}</div>
          </div>
          <div class="summary-row total">
            <div class="summary-label">Total:</div>
            <div class="summary-value">${formatPrice(order.totalAmount)}</div>
          </div>
        </div>
      </div>
    `;
  }

  // Create HTML for an order item
  function createOrderItemHTML(item) {
    return `
      <div class="order-item">
        <div class="item-image">
          <img src="${item.imageUrl || "images/default-product.jpg"}" alt="${
      item.name
    }">
        </div>
        <div class="item-info">
          <h4>${item.name}</h4>
          <p>Quantity: ${item.quantity}</p>
        </div>
        <div class="item-price">${formatPrice(item.price * item.quantity)}</div>
      </div>
    `;
  }

  // Helper function to get status class
  function getStatusClass(status) {
    const statusMap = {
      Processing: "status-processing",
      Shipped: "status-shipped",
      Delivered: "status-delivered",
      Cancelled: "status-cancelled",
    };
    return statusMap[status] || "";
  }
});

// Helper function to format price
function formatPrice(price) {
  return `$${price?.toFixed(2)}`;
}
