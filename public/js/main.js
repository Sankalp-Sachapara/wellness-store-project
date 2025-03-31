// Base URL for API - configurable for different environments
const API_BASE_URL = {
  development: "http://localhost:5000/api",
  production: "https://wellness-store-api.example.com/api", // Change this to your production API URL
};

// Determine environment - can be extended with more sophisticated detection
const isProduction =
  window.location.hostname !== "localhost" &&
  !window.location.hostname.includes("127.0.0.1");

// Set the API URL based on environment
const API_URL = isProduction
  ? API_BASE_URL.production
  : API_BASE_URL.development;

// Helper functions
function formatPrice(price) {
  return `$${parseFloat(price).toFixed(2)}`;
}

function displayErrorMessage(element, message) {
  if (element) {
    element.textContent = message;
    element.style.display = "block";
  } else {
    console.error(`Error message element not found: ${message}`);
  }
}

function clearErrorMessages() {
  document.querySelectorAll(".error-message").forEach((el) => {
    el.textContent = "";
    el.style.display = "none";
  });
}

function getCategoryIcon(category) {
  const icons = {
    supplements: "pill",
    fitness: "dumbbell",
    nutrition: "apple-alt",
    skincare: "spa",
    wellness: "heart",
  };

  return icons[category] || "box";
}

function getStarRating(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  let starsHTML = "";

  // Full stars
  for (let i = 0; i < fullStars; i++) {
    starsHTML += '<i class="fas fa-star"></i>';
  }

  // Half star
  if (halfStar) {
    starsHTML += '<i class="fas fa-star-half-alt"></i>';
  }

  // Empty stars
  for (let i = 0; i < emptyStars; i++) {
    starsHTML += '<i class="far fa-star"></i>';
  }

  return starsHTML;
}

// User authentication functions
function checkAuthStatus() {
  const user = localStorage.getItem("user");

  if (user) {
    const userData = JSON.parse(user);
    updateNavForLoggedInUser(userData);
    initializeCartIcon();
    return userData;
  }

  return null;
}

function initializeCartIcon() {
  const navButtons = document.querySelector(".nav-buttons");
  const existingCartIcon = document.querySelector(".cart-icon");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!existingCartIcon && navButtons && user) {
    const cartLink = document.createElement("a");
    cartLink.href = "cart.html";
    cartLink.className = "cart-icon";
    cartLink.innerHTML = `
      <i class="fas fa-shopping-cart"></i>
      <span id="cart-counter" class="cart-counter empty"></span>
    `;

    // Insert before other buttons
    navButtons.insertBefore(cartLink, navButtons.firstChild);

    // Load initial cart count
    updateCartCount(user._id);
  }
}

async function updateCartCount(userId) {
  if (!userId) return;

  try {
    const response = await fetch(`${API_URL}/carts/${userId}`);
    if (!response.ok) return;

    const cart = await response.json();
    const uniqueProductCount = cart.items ? cart.items.length : 0; // Count of unique products

    const cartCounter = document.getElementById("cart-counter");
    if (cartCounter) {
      cartCounter.textContent = uniqueProductCount;
      cartCounter.classList.toggle("empty", uniqueProductCount === 0);
    }
  } catch (error) {
    console.error("Error fetching cart:", error);
  }
}

// Update nav for logged in user
// function updateNavForLoggedInUser(user) {
//   const navButtons = document.querySelector(".nav-buttons");

//   if (navButtons) {
//     navButtons.innerHTML = `
//       <span class="user-greeting">Hello, ${user.username}</span>
//       ${
//         user.isAdmin
//           ? '<a href="admin/index.html" class="btn admin-btn">Admin Dashboard</a>'
//           : ""
//       }
//       <a href="#" id="logout-btn" class="btn logout-btn">Logout</a>
//     `;

//     // Reinitialize cart icon after updating buttons
//     initializeCartIcon();

//     document
//       .getElementById("logout-btn")
//       .addEventListener("click", handleLogout);
//   }
// }

function updateNavForLoggedInUser(user) {
  const navButtons = document.querySelector(".nav-buttons");

  if (navButtons) {
    // Admin panel specific check - use simple logout button in admin pages
    if (window.location.pathname.includes('/admin/')) {
      navButtons.innerHTML = `
        <div class="user-dropdown">
          <div class="user-greeting">
            Hello, ${user.username} <i class="fas fa-chevron-down"></i>
          </div>
          <div class="dropdown-menu">
            <a href="index.html" class="dropdown-item">
              <i class="fas fa-tachometer-alt"></i> Admin Dashboard
            </a>
            <div class="dropdown-divider"></div>
            <a href="#" id="admin-logout" class="dropdown-item">
              <i class="fas fa-sign-out-alt"></i> Logout
            </a>
          </div>
        </div>
      `;

      // Add dropdown toggle functionality
      const userDropdown = document.querySelector(".user-dropdown");
      const greeting = document.querySelector(".user-greeting");

      greeting.addEventListener("click", (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle("active");
      });

      // Close dropdown when clicking outside
      document.addEventListener("click", () => {
        userDropdown.classList.remove("active");
      });

      const adminLogoutBtn = document.getElementById("admin-logout");
      if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener("click", (e) => {
          e.preventDefault();
          logout();
        });
      }
      return;
    }

    // For non-admin pages, keep the existing dropdown with all options
    navButtons.innerHTML = `
      <div class="user-dropdown">
        <div class="user-greeting">
          Hello, ${user.username} <i class="fas fa-chevron-down"></i>
        </div>
        <div class="dropdown-menu">
          <a href="profile.html" class="dropdown-item">
            <i class="fas fa-user"></i> My Profile
          </a>
          <a href="orders.html" class="dropdown-item">
            <i class="fas fa-shopping-bag"></i> My Orders
          </a>
          ${user.isAdmin
        ? `
            <div class="dropdown-divider"></div>
            <a href="admin/index.html" class="dropdown-item">
              <i class="fas fa-cog"></i> Admin Dashboard
            </a>
          `
        : ""
      }
          <div class="dropdown-divider"></div>
          <a href="#" id="logout-btn" class="dropdown-item">
            <i class="fas fa-sign-out-alt"></i> Logout
          </a>
        </div>
      </div>
    `;

    // Add dropdown toggle functionality
    const userDropdown = document.querySelector(".user-dropdown");
    const greeting = document.querySelector(".user-greeting");

    greeting.addEventListener("click", (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle("active");
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", () => {
      userDropdown.classList.remove("active");
    });

    // Add logout handler
    document.getElementById("logout-btn").addEventListener("click", (e) => {
      e.preventDefault();
      handleLogout(e);
    });
  }
}

// Handle logout functionality
function handleLogout(e) {
  e.preventDefault();
  logout();
}

function logout() {
  // Clear user data
  localStorage.removeItem("user");
  localStorage.removeItem("token");

  // Redirect to home page after short delay
  setTimeout(() => {
    window.location.href = "./index.html";
  }, 300);
}

// Page initialization
document.addEventListener("DOMContentLoaded", () => {
  checkAuthStatus();

  // Handle logout if admin-logout button exists
  const adminLogoutBtn = document.getElementById("admin-logout");
  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }
});

// Form validation
function validateEmail(email) {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
}

function validatePassword(password) {
  return password.length >= 6;
}

// URL parameter helper
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Create product card HTML
function createProductCard(product) {
  return `
    <div class="product-card">
      <img src="${product.imageUrl || "images/default-product.jpg"}" alt="${product.name
    }" class="product-img">
      <div class="product-info">
        <h3 class="product-title">${product.name}</h3>
        <p class="product-category">${product.category}</p>
        <p class="product-price">${formatPrice(product.price)}</p>
        <div class="product-rating">${getStarRating(product.rating)}</div>
        <a href="product-detail.html?id=${product._id
    }" class="btn">View Details</a>
      </div>
    </div>
  `;
}

// Error handling helper
function handleApiError(error, errorMessage = "An error occurred") {
  console.error(error);
  return {
    success: false,
    message: errorMessage,
  };
}

// Show notification helper
function showNotification(message, isError = false) {
  // Create notification element if it doesn't exist
  let notification = document.getElementById("notification");

  if (!notification) {
    notification = document.createElement("div");
    notification.id = "notification";
    notification.className = isError
      ? "notification error"
      : "notification success";
    document.body.appendChild(notification);
  } else {
    notification.className = isError
      ? "notification error"
      : "notification success";
  }

  notification.textContent = message;
  notification.style.display = "block";

  // Hide after 3 seconds
  setTimeout(() => {
    notification.style.display = "none";
  }, 3000);
}
