// Cart page functionality
document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const cartProductsList = document.getElementById('cart-products-list');
  const cartEmptyElement = document.getElementById('cart-empty');
  const cartItemsElement = document.getElementById('cart-items');
  const cartSubtotalElement = document.getElementById('cart-subtotal');
  const cartTotalElement = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkout-btn');
  const clearCartBtn = document.getElementById('clear-cart-btn');
  
  // Ensure user is logged in
  const user = checkAuthStatus();
  if (!user) {
    window.location.href = 'login.html?redirect=cart.html';
    return;
  }
  
  // Fetch cart data
  fetchCart();
  
  // Add event listeners
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', goToCheckout);
  }
  
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', clearCart);
  }
  
  // Fetch user's cart
  async function fetchCart() {
    try {
      const response = await fetch(`${API_URL}/carts/${user._id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      
      const cart = await response.json();
      
      if (!cart.items || cart.items.length === 0) {
        showEmptyCart();
        return;
      }
      
      renderCart(cart);
    } catch (error) {
      console.error('Error fetching cart:', error);
      cartProductsList.innerHTML = `<p class="error-message">Error loading cart. Please try again later.</p>`;
    }
  }
  
  // Render cart items
  function renderCart(cart) {
    if (!cart.items || cart.items.length === 0) {
      showEmptyCart();
      return;
    }
    
    hideEmptyCart();
    
    let cartHTML = '';
    
    cart.items.forEach(item => {
      cartHTML += `
        <div class="cart-item" data-item-id="${item._id}">
          <div class="cart-product">
            <img src="${item.imageUrl || 'images/default-product.jpg'}" alt="${item.name}">
            <div class="cart-product-info">
              <h3>${item.name}</h3>
              <p>${item.category}</p>
            </div>
          </div>
          <div class="cart-price">${formatPrice(item.price)}</div>
          <div class="cart-quantity">
            <div class="quantity-input">
              <button class="quantity-btn decrease-btn" data-item-id="${item._id}">-</button>
              <span class="quantity-value">${item.quantity}</span>
              <button class="quantity-btn increase-btn" data-item-id="${item._id}">+</button>
            </div>
          </div>
          <div class="cart-total">${formatPrice(item.price * item.quantity)}</div>
          <div class="cart-action">
            <button class="remove-btn" data-item-id="${item._id}">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      `;
    });
    
    cartProductsList.innerHTML = cartHTML;
    
    // Update cart totals
    updateCartTotals(cart.totalAmount);
    
    // Add event listeners to quantity buttons and remove buttons
    document.querySelectorAll('.increase-btn').forEach(btn => {
      btn.addEventListener('click', () => increaseQuantity(btn.getAttribute('data-item-id')));
    });
    
    document.querySelectorAll('.decrease-btn').forEach(btn => {
      btn.addEventListener('click', () => decreaseQuantity(btn.getAttribute('data-item-id')));
    });
    
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', () => removeItem(btn.getAttribute('data-item-id')));
    });
  }
  
  // Show empty cart message
  function showEmptyCart() {
    cartEmptyElement.style.display = 'block';
    cartItemsElement.style.display = 'none';
  }
  
  // Hide empty cart message
  function hideEmptyCart() {
    cartEmptyElement.style.display = 'none';
    cartItemsElement.style.display = 'block';
  }
  
  // Update cart totals
  function updateCartTotals(total) {
    cartSubtotalElement.textContent = formatPrice(total);
    cartTotalElement.textContent = formatPrice(total);
  }
  
  // Increase item quantity
  async function increaseQuantity(itemId) {
    try {
      const quantityElement = document.querySelector(`.cart-item[data-item-id="${itemId}"] .quantity-value`);
      const currentQuantity = parseInt(quantityElement.textContent);
      const newQuantity = currentQuantity + 1;
      
      const response = await fetch(`${API_URL}/carts/${user._id}/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: newQuantity })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update quantity');
      }
      
      const updatedCart = await response.json();
      renderCart(updatedCart);
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity. Please try again.');
    }
  }
  
  // Decrease item quantity
  async function decreaseQuantity(itemId) {
    try {
      const quantityElement = document.querySelector(`.cart-item[data-item-id="${itemId}"] .quantity-value`);
      const currentQuantity = parseInt(quantityElement.textContent);
      
      if (currentQuantity <= 1) {
        // If quantity is 1 or less, remove the item
        await removeItem(itemId);
        return;
      }
      
      const newQuantity = currentQuantity - 1;
      
      const response = await fetch(`${API_URL}/carts/${user._id}/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: newQuantity })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update quantity');
      }
      
      const updatedCart = await response.json();
      renderCart(updatedCart);
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity. Please try again.');
    }
  }
  
  // Remove item from cart
  async function removeItem(itemId) {
    try {
      const response = await fetch(`${API_URL}/carts/${user._id}/items/${itemId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove item');
      }
      
      const updatedCart = await response.json();
      renderCart(updatedCart);
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item. Please try again.');
    }
  }
  
  // Clear cart
  async function clearCart() {
    if (!confirm('Are you sure you want to clear your cart?')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/carts/${user._id}/clear`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }
      
      showEmptyCart();
      updateCartTotals(0);
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('Failed to clear cart. Please try again.');
    }
  }
  
  // Go to checkout
  function goToCheckout() {
    window.location.href = 'checkout.html';
  }
});
