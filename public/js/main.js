// Base URL for API
const API_URL = 'http://localhost:3000/api';

// Helper functions
function formatPrice(price) {
  return `$${parseFloat(price).toFixed(2)}`;
}

function displayErrorMessage(element, message) {
  element.textContent = message;
  element.style.display = 'block';
}

function clearErrorMessages() {
  document.querySelectorAll('.error-message').forEach(el => {
    el.textContent = '';
    el.style.display = 'none';
  });
}

function getCategoryIcon(category) {
  const icons = {
    'supplements': 'pill',
    'fitness': 'dumbbell',
    'nutrition': 'apple-alt',
    'skincare': 'spa',
    'wellness': 'heart'
  };
  
  return icons[category] || 'box';
}

function getStarRating(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
  let starsHTML = '';
  
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
  const user = localStorage.getItem('user');
  
  if (user) {
    const userData = JSON.parse(user);
    updateNavForLoggedInUser(userData);
    return userData;
  }
  
  return null;
}

function updateNavForLoggedInUser(user) {
  const navButtons = document.querySelector('.nav-buttons');
  
  if (navButtons) {
    navButtons.innerHTML = `
      <span class="user-greeting">Hello, ${user.username}</span>
      ${user.isAdmin ? '<a href="/admin/index.html" class="btn">Admin Dashboard</a>' : ''}
      <a href="#" id="logout-btn" class="btn">Logout</a>
    `;
    
    // Add logout event listener
    document.getElementById('logout-btn').addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
}

function logout() {
  localStorage.removeItem('user');
  window.location.href = '/index.html';
}

// Page initialization
document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();
  
  // Handle logout if admin-logout button exists
  const adminLogoutBtn = document.getElementById('admin-logout');
  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', (e) => {
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
      <img src="${product.imageUrl || 'images/default-product.jpg'}" alt="${product.name}" class="product-img">
      <div class="product-info">
        <h3 class="product-title">${product.name}</h3>
        <p class="product-category">${product.category}</p>
        <p class="product-price">${formatPrice(product.price)}</p>
        <div class="product-rating">${getStarRating(product.rating)}</div>
        <a href="product-detail.html?id=${product._id}" class="btn">View Details</a>
      </div>
    </div>
  `;
}
