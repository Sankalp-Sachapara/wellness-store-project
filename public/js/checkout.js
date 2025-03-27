// Checkout page functionality
document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const billingForm = document.getElementById('billing-form');
  const toReviewBtn = document.getElementById('to-review-btn');
  const backToBillingBtn = document.getElementById('back-to-billing-btn');
  const placeOrderBtn = document.getElementById('place-order-btn');
  const stepElements = document.querySelectorAll('.step');
  const stepContentElements = document.querySelectorAll('.checkout-step-content');
  
  // Get billing form elements
  const firstNameInput = document.getElementById('firstName');
  const lastNameInput = document.getElementById('lastName');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const addressInput = document.getElementById('address');
  const cityInput = document.getElementById('city');
  const stateInput = document.getElementById('state');
  const zipCodeInput = document.getElementById('zipCode');
  const countryInput = document.getElementById('country');
  
  // Get order review elements
  const billingDetailsElement = document.getElementById('billing-details');
  const orderItemsElement = document.getElementById('order-items');
  const reviewSubtotalElement = document.getElementById('review-subtotal');
  const reviewTotalElement = document.getElementById('review-total');
  const orderNumberElement = document.getElementById('order-number');
  
  // Ensure user is logged in
  const user = checkAuthStatus();
  if (!user) {
    window.location.href = 'login.html?redirect=checkout.html';
    return;
  }
  
  // Load cart data
  loadCart();
  
  // Add event listeners
  if (toReviewBtn) {
    toReviewBtn.addEventListener('click', () => {
      if (validateBillingForm()) {
        goToStep(2);
        updateReviewStep();
      }
    });
  }
  
  if (backToBillingBtn) {
    backToBillingBtn.addEventListener('click', () => goToStep(1));
  }
  
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', placeOrder);
  }
  
  // Go to specific step
  function goToStep(stepNumber) {
    // Update step indicators
    stepElements.forEach((step, index) => {
      if (index < stepNumber) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });
    
    // Show the active step content and hide others
    stepContentElements.forEach((content, index) => {
      if (index === stepNumber - 1) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });
    
    // Scroll to top
    window.scrollTo(0, 0);
  }
  
  // Load cart data
  async function loadCart() {
    try {
      const response = await fetch(`${API_URL}/carts/${user._id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      
      const cart = await response.json();
      
      if (!cart.items || cart.items.length === 0) {
        window.location.href = 'cart.html';
        return;
      }
      
      // Pre-fill email if available
      if (emailInput && user.email) {
        emailInput.value = user.email;
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      alert('Failed to load cart data. Please try again.');
      window.location.href = 'cart.html';
    }
  }
  
  // Validate billing form
  function validateBillingForm() {
    clearErrorMessages();
    
    let isValid = true;
    
    // Validate first name
    if (!firstNameInput.value.trim()) {
      displayErrorMessage(document.getElementById('firstName-error'), 'First name is required');
      isValid = false;
    }
    
    // Validate last name
    if (!lastNameInput.value.trim()) {
      displayErrorMessage(document.getElementById('lastName-error'), 'Last name is required');
      isValid = false;
    }
    
    // Validate email
    if (!emailInput.value.trim()) {
      displayErrorMessage(document.getElementById('email-error'), 'Email is required');
      isValid = false;
    } else if (!validateEmail(emailInput.value.trim())) {
      displayErrorMessage(document.getElementById('email-error'), 'Please enter a valid email address');
      isValid = false;
    }
    
    // Validate phone
    if (!phoneInput.value.trim()) {
      displayErrorMessage(document.getElementById('phone-error'), 'Phone number is required');
      isValid = false;
    }
    
    // Validate address
    if (!addressInput.value.trim()) {
      displayErrorMessage(document.getElementById('address-error'), 'Address is required');
      isValid = false;
    }
    
    // Validate city
    if (!cityInput.value.trim()) {
      displayErrorMessage(document.getElementById('city-error'), 'City is required');
      isValid = false;
    }
    
    // Validate state
    if (!stateInput.value.trim()) {
      displayErrorMessage(document.getElementById('state-error'), 'State is required');
      isValid = false;
    }
    
    // Validate zip code
    if (!zipCodeInput.value.trim()) {
      displayErrorMessage(document.getElementById('zipCode-error'), 'ZIP code is required');
      isValid = false;
    }
    
    // Validate country
    if (!countryInput.value) {
      displayErrorMessage(document.getElementById('country-error'), 'Country is required');
      isValid = false;
    }
    
    return isValid;
  }
  
  // Update review step with billing and cart information
  async function updateReviewStep() {
    try {
      // Get cart data
      const response = await fetch(`${API_URL}/carts/${user._id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      
      const cart = await response.json();
      
      if (!cart.items || cart.items.length === 0) {
        window.location.href = 'cart.html';
        return;
      }
      
      // Update billing details
      const billingDetails = `
        <div class="billing-detail"><strong>Name:</strong> ${firstNameInput.value} ${lastNameInput.value}</div>
        <div class="billing-detail"><strong>Email:</strong> ${emailInput.value}</div>
        <div class="billing-detail"><strong>Phone:</strong> ${phoneInput.value}</div>
        <div class="billing-detail"><strong>Address:</strong> ${addressInput.value}</div>
        <div class="billing-detail"><strong>City:</strong> ${cityInput.value}</div>
        <div class="billing-detail"><strong>State/Province:</strong> ${stateInput.value}</div>
        <div class="billing-detail"><strong>ZIP/Postal Code:</strong> ${zipCodeInput.value}</div>
        <div class="billing-detail"><strong>Country:</strong> ${countryInput.options[countryInput.selectedIndex].text}</div>
      `;
      
      billingDetailsElement.innerHTML = billingDetails;
      
      // Update order items
      let orderItemsHTML = '';
      
      cart.items.forEach(item => {
        orderItemsHTML += `
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
      
      orderItemsElement.innerHTML = orderItemsHTML;
      
      // Update order summary
      reviewSubtotalElement.textContent = formatPrice(cart.totalAmount);
      reviewTotalElement.textContent = formatPrice(cart.totalAmount);
    } catch (error) {
      console.error('Error updating review step:', error);
      alert('Failed to update review information. Please try again.');
      goToStep(1);
    }
  }
  
  // Place order
  async function placeOrder() {
    try {
      // Get billing info
      const billingInfo = {
        firstName: firstNameInput.value,
        lastName: lastNameInput.value,
        email: emailInput.value,
        phone: phoneInput.value,
        address: addressInput.value,
        city: cityInput.value,
        state: stateInput.value,
        zipCode: zipCodeInput.value,
        country: countryInput.value
      };
      
      // Create order
      const response = await fetch(`${API_URL}/orders/${user._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ billingInfo })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create order');
      }
      
      const order = await response.json();
      
      // Display order number
      orderNumberElement.textContent = order.order.orderNumber;
      
      // Show order confirmation
      goToStep(3);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  }
});
