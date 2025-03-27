// Checkout page functionality
document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const billingForm = document.getElementById('billing-form');
  const stepElements = document.querySelectorAll('.checkout-step-content');
  const stepIndicators = document.querySelectorAll('.step');
  const toReviewBtn = document.getElementById('to-review-btn');
  const backToBillingBtn = document.getElementById('back-to-billing-btn');
  const placeOrderBtn = document.getElementById('place-order-btn');
  const billingDetails = document.getElementById('billing-details');
  const orderItems = document.getElementById('order-items');
  const reviewSubtotal = document.getElementById('review-subtotal');
  const reviewTotal = document.getElementById('review-total');
  
  let billingInfo = {};
  let cartData = {};
  
  // Ensure user is logged in
  const user = checkAuthStatus();
  if (!user) {
    window.location.href = 'login.html?redirect=checkout.html';
    return;
  }
  
  // Fetch cart data
  fetchCart();
  
  // Add event listeners
  if (toReviewBtn) {
    toReviewBtn.addEventListener('click', goToReviewStep);
  }
  
  if (backToBillingBtn) {
    backToBillingBtn.addEventListener('click', goToBillingStep);
  }
  
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', placeOrder);
  }
  
  if (billingForm) {
    billingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      goToReviewStep();
    });
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
        // Redirect to cart page if cart is empty
        window.location.href = 'cart.html';
        return;
      }
      
      cartData = cart;
    } catch (error) {
      console.error('Error fetching cart:', error);
      alert('Error loading cart data. Please try again later.');
      window.location.href = 'cart.html';
    }
  }
  
  // Go to review step
  function goToReviewStep() {
    // Validate billing form
    if (!validateBillingForm()) {
      return;
    }
    
    // Collect billing information
    billingInfo = {
      firstName: document.getElementById('firstName').value.trim(),
      lastName: document.getElementById('lastName').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      address: document.getElementById('address').value.trim(),
      city: document.getElementById('city').value.trim(),
      state: document.getElementById('state').value.trim(),
      zipCode: document.getElementById('zipCode').value.trim(),
      country: document.getElementById('country').value
    };
    
    // Populate review section
    populateReviewSection();
    
    // Show review step
    showStep(1);
  }
  
  // Go back to billing step
  function goToBillingStep() {
    showStep(0);
  }
  
  // Show confirmation step
  function showConfirmationStep() {
    showStep(2);
  }
  
  // Show the specified step
  function showStep(stepIndex) {
    // Hide all steps
    stepElements.forEach(step => {
      step.classList.remove('active');
    });
    
    // Update step indicators
    stepIndicators.forEach((indicator, index) => {
      if (index <= stepIndex) {
        indicator.classList.add('active');
      } else {
        indicator.classList.remove('active');
      }
    });
    
    // Show the selected step
    stepElements[stepIndex].classList.add('active');
  }
  
  // Validate billing form
  function validateBillingForm() {
    clearErrorMessages();
    
    let isValid = true;
    
    // Required fields
    const requiredFields = [
      { id: 'firstName', name: 'First Name' },
      { id: 'lastName', name: 'Last Name' },
      { id: 'email', name: 'Email' },
      { id: 'phone', name: 'Phone' },
      { id: 'address', name: 'Address' },
      { id: 'city', name: 'City' },
      { id: 'state', name: 'State' },
      { id: 'zipCode', name: 'ZIP Code' },
      { id: 'country', name: 'Country' }
    ];
    
    // Check each required field
    requiredFields.forEach(field => {
      const input = document.getElementById(field.id);
      const error = document.getElementById(`${field.id}-error`);
      
      if (!input.value.trim()) {
        displayErrorMessage(error, `${field.name} is required`);
        isValid = false;
      }
    });
    
    // Validate email format
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('email-error');
    
    if (emailInput.value.trim() && !validateEmail(emailInput.value.trim())) {
      displayErrorMessage(emailError, 'Please enter a valid email address');
      isValid = false;
    }
    
    return isValid;
  }
  
  // Populate review section
  function populateReviewSection() {
    // Billing details
    billingDetails.innerHTML = `
      <div class="billing-detail"><strong>Name:</strong> ${billingInfo.firstName} ${billingInfo.lastName}</div>
      <div class="billing-detail"><strong>Email:</strong> ${billingInfo.email}</div>
      <div class="billing-detail"><strong>Phone:</strong> ${billingInfo.phone}</div>
      <div class="billing-detail"><strong>Address:</strong> ${billingInfo.address}</div>
      <div class="billing-detail"><strong>City:</strong> ${billingInfo.city}</div>
      <div class="billing-detail"><strong>State:</strong> ${billingInfo.state}</div>
      <div class="billing-detail"><strong>ZIP Code:</strong> ${billingInfo.zipCode}</div>
      <div class="billing-detail"><strong>Country:</strong> ${billingInfo.country}</div>
    `;
    
    // Order items
    let itemsHTML = '';
    
    cartData.items.forEach(item => {
      itemsHTML += `
        <div class="review-item">
          <img src="${item.imageUrl || 'images/default-product.jpg'}" alt="${item.name}">
          <div class="review-item-info">
            <h4>${item.name}</h4>
            <p>Quantity: ${item.quantity}</p>
          </div>
          <div class="review-item-price">${formatPrice(item.price * item.quantity)}</div>
        </div>
      `;
    });
    
    orderItems.innerHTML = itemsHTML;
    
    // Order totals
    reviewSubtotal.textContent = formatPrice(cartData.totalAmount);
    reviewTotal.textContent = formatPrice(cartData.totalAmount);
  }
  
  // Place order
  async function placeOrder() {
    try {
      // Create order
      const response = await fetch(`${API_URL}/orders/${user._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          billingInfo
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to place order');
      }
      
      const orderData = await response.json();
      
      // Show order number in confirmation step
      document.getElementById('order-number').textContent = orderData.order.orderNumber;
      
      // Show confirmation step
      showConfirmationStep();
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  }
});
