// Cart page functionality
document.addEventListener('DOMContentLoaded', () => {
  const cartContainer = document.getElementById('cart-container');
  
  // Check if user is logged in
  const user = checkAuthStatus();
  if (!user) {
    // Redirect to login if user is not logged in
    window.location.href = 'login.html?redirect=cart.html';
    return;
  }
  
  // Fetch cart data
  fetchCartData();
  
  // Function to fetch cart data
  async function fetchCartData() {
    try {
      const response = await fetch(`${API_URL}/carts/${user._id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch cart data');
      }
      
      const cart = await response.json();
      renderCart(cart);
      
      // Update cart counter
      updateCartCounter(cart.items.length);
    } catch (error) {
      console.error('Error fetching cart data:', error);
      cartContainer.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          <p>Failed to load cart data. Please try again later.</p>
          <button class="btn btn-primary" onclick="window.location.reload()">Retry</button>
        </div>
      `;
    }
  }
  
  // Function to render cart
  function renderCart(cart) {
    if (!cart.items || cart.items.length === 0) {
      // Empty cart
      cartContainer.innerHTML = `
        <div class="empty-cart">
          <i class="fas fa-shopping-cart fa-4x"></i>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any products to your cart yet.</p>
          <a href="products.html" class="btn btn-primary">Browse Products</a>
        </div>
      `;
      return;
    }
    
    // Cart has items
    let cartHTML = `
      <div class="cart-items">
        <div class="cart-header">
          <div class="cart-header-product">Product</div>
          <div class="cart-header-price">Price</div>
          <div class="cart-header-quantity">Quantity</div>
          <div class="cart-header-total">Total</div>
          <div class="cart-header-actions">Actions</div>
        </div>
    `;
    
    // Add cart items
    cart.items.forEach(item => {
      const itemTotal = item.price * item.quantity;
      
      cartHTML += `
        <div class="cart-item" data-item-id="${item._id}">
          <div class="cart-item-product">
            <img src="${item.imageUrl || '../images/default-product.jpg'}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-details">
              <h3 class="cart-item-name">${item.name}</h3>
            </div>
          </div>
          <div class="cart-item-price">${formatPrice(item.price)}</div>
          <div class="cart-item-quantity">
            <div class="quantity-controls">
              <button class="quantity-btn quantity-decrease" onclick="updateQuantity('${item._id}', ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''}>
                <i class="fas fa-minus"></i>
              </button>
              <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="99" onchange="updateQuantity('${item._id}', this.value)">
              <button class="quantity-btn quantity-increase" onclick="updateQuantity('${item._id}', ${item.quantity + 1})">
                <i class="fas fa-plus"></i>
              </button>
            </div>
          </div>
          <div class="cart-item-total">${formatPrice(itemTotal)}</div>
          <div class="cart-item-actions">
            <button class="btn btn-danger btn-sm" onclick="removeFromCart('${item._id}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `;
    });
    
    // Cart summary
    cartHTML += `
      </div>
      <div class="cart-summary">
        <div class="cart-summary-row">
          <span>Subtotal:</span>
          <span>${formatPrice(cart.totalAmount)}</span>
        </div>
        <div class="cart-summary-row">
          <span>Shipping:</span>
          <span>Calculated at checkout</span>
        </div>
        <div class="cart-summary-row cart-summary-total">
          <span>Total:</span>
          <span>${formatPrice(cart.totalAmount)}</span>
        </div>
        <div class="cart-actions">
          <a href="products.html" class="btn btn-secondary">Continue Shopping</a>
          <a href="checkout.html" class="btn btn-primary">Proceed to Checkout</a>
        </div>
        <button class="btn btn-danger btn-sm" onclick="clearCart()">
          <i class="fas fa-trash"></i> Clear Cart
        </button>
      </div>
    `;
    
    cartContainer.innerHTML = cartHTML;
  }
});

// Function to update cart counter
function updateCartCounter(count) {
  const cartCounter = document.getElementById('cart-counter');
  if (cartCounter) {
    cartCounter.textContent = count;
    cartCounter.style.display = count > 0 ? 'flex' : 'none';
  }
}

// Function to update quantity
async function updateQuantity(itemId, newQuantity) {
  const user = checkAuthStatus();
  if (!user) return;
  
  // Validate quantity
  newQuantity = parseInt(newQuantity);
  if (isNaN(newQuantity) || newQuantity < 1) {
    newQuantity = 1;
  }
  
  try {
    const response = await fetch(`${API_URL}/carts/${user._id}/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        quantity: newQuantity
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update quantity');
    }
    
    // Refresh cart
    window.location.reload();
  } catch (error) {
    console.error('Error updating quantity:', error);
    alert('Failed to update quantity. Please try again.');
  }
}

// Function to remove item from cart
async function removeFromCart(itemId) {
  const user = checkAuthStatus();
  if (!user) return;
  
  if (!confirm('Are you sure you want to remove this item from your cart?')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/carts/${user._id}/items/${itemId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to remove item from cart');
    }
    
    // Refresh cart
    window.location.reload();
  } catch (error) {
    console.error('Error removing item from cart:', error);
    alert('Failed to remove item from cart. Please try again.');
  }
}

// Function to clear cart
async function clearCart() {
  const user = checkAuthStatus();
  if (!user) return;
  
  if (!confirm('Are you sure you want to clear your entire cart?')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/carts/${user._id}/clear`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to clear cart');
    }
    
    // Refresh cart
    window.location.reload();
  } catch (error) {
    console.error('Error clearing cart:', error);
    alert('Failed to clear cart. Please try again.');
  }
}