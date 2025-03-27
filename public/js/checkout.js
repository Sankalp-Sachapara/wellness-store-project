// Checkout page functionality
document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements for steps
  const step1 = document.getElementById('step-1');
  const step2 = document.getElementById('step-2');
  const step3 = document.getElementById('step-3');
  
  // Get DOM elements for buttons
  const toReviewBtn = document.getElementById('to-review-btn');
  const backToBillingBtn = document.getElementById('back-to-billing-btn');
  const placeOrderBtn = document.getElementById('place-order-btn');
  
  // Get DOM elements for step indicators
  const stepIndicators = document.querySelectorAll('.step');
  
  // Get DOM elements for order details
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
  
  // Get form elements
  const billingForm = document.getElementById('billing-form');
  
  // Initialize form data
  let formData = {};
  
  // Fetch cart data
  fetchCart();
  
  // Add event listeners
  if (toReviewBtn) {
    toReviewBtn.addEventListener('click', goToReview);
  }
  
  if (backToBillingBtn) {
    backToBillingBtn.addEventListener('click', goToBilling);
  }
  
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', placeOrder);
  }
  
  if (billingForm) {
    billingForm.addEventListener('submit', (e) => e.preventDefault());
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
        window.location.href = 'cart.html';
        return;
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      alert('Failed to load your cart. Please try again.');
      window.location.href = 'cart.html';
    }
  }
  
  // Go to review step
  function goToReview() {
    // Validate form first
    if (!validateBillingForm()) {
      return;
    }
    
    // Collect form data
    formData = {
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
    
    // Update billing details in review
    updateBillingDetails();
    
    // Fetch cart and update order items
    fetchAndUpdateOrderItems();
    
    // Show step 2
    step1.classList.remove('active');
    step2.classList.add('active');
    step3.classList.remove('active');
    
    // Update step indicators
    stepIndicators[0].classList.add('active');
    stepIndicators[1].classList.add('active');
    stepIndicators[2].classList.remove('active');
    
    // Scroll to top
    window.scrollTo(0, 0);
  }
  
  // Go back to billing step
  function goToBilling() {
    // Show step 1
    step1.classList.add('active');
    step2.classList.remove('active');
    step3.classList.remove('active');
    
    // Update step indicators
    stepIndicators[0].classList.add('active');
    stepIndicators[1].classList.remove('active');
    stepIndicators[2].classList.remove('active');
    
    // Scroll to top
    window.scrollTo(0, 0);
  }
  
  // Validate billing form
  function validateBillingForm() {
    // Reset previous error messages
    clearErrorMessages();
    
    let isValid = true;
    
    // Validate first name
    if (!document.getElementById('firstName').value.trim()) {
      displayErrorMessage(document.getElementById('firstName-error'), 'First name is required');
      isValid = false;
    }
    
    // Validate last name
    if (!document.getElementById('lastName').value.trim()) {
      displayErrorMessage(document.getElementById('lastName-error'), 'Last name is required');
      isValid = false;
    }
    
    // Validate email
    const email = document.getElementById('email').value.trim();
    if (!email) {
      displayErrorMessage(document.getElementById('email-error'), 'Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      displayErrorMessage(document.getElementById('email-error'), 'Please enter a valid email address');
      isValid = false;
    }
    
    // Validate phone
    if (!document.getElementById('phone').value.trim()) {
      displayErrorMessage(document.getElementById('phone-error'), 'Phone number is required');
      isValid = false;
    }
    
    // Validate address
    if (!document.getElementById('address').value.trim()) {
      displayErrorMessage(document.getElementById('address-error'), 'Address is required');
      isValid = false;
    }
    
    // Validate city
    if (!document.getElementById('city').value.trim()) {
      displayErrorMessage(document.getElementById('city-error'), 'City is required');
      isValid = false;
    }
    
    // Validate state
    if (!document.getElementById('state').value.trim()) {
      displayErrorMessage(document.getElementById('state-error'), 'State/Province is required');
      isValid = false;
    }
    
    // Validate zip code
    if (!document.getElementById('zipCode').value.trim()) {
      displayErrorMessage(document.getElementById('zipCode-error'), 'ZIP/Postal code is required');
      isValid = false;
    }
    
    // Validate country
    if (!document.getElementById('country').value) {
      displayErrorMessage(document.getElementById('country-error'), 'Country is required');
      isValid = false;
    }
    
    return isValid;
  }
  
  // Update billing details in review step
  function updateBillingDetails() {
    const billingHTML = `
      <div class="billing-detail"><strong>Name:</strong> ${formData.firstName} ${formData.lastName}</div>
      <div class="billing-detail"><strong>Email:</strong> ${formData.email}</div>
      <div class="billing-detail"><strong>Phone:</strong> ${formData.phone}</div>
      <div class="billing-detail"><strong>Address:</strong> ${formData.address}</div>
      <div class="billing-detail"><strong>City:</strong> ${formData.city}</div>
      <div class="billing-detail"><strong>State:</strong> ${formData.state}</div>
      <div class="billing-detail"><strong>ZIP/Postal Code:</strong> ${formData.zipCode}</div>
      <div class="billing-detail"><strong>Country:</strong> ${formData.country}</div>
    `;
    
    billingDetailsElement.innerHTML = billingHTML;
  }
  
  // Fetch cart and update order items in review step
  async function fetchAndUpdateOrderItems() {
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
      
      // Update totals
      reviewSubtotalElement.textContent = formatPrice(cart.totalAmount);
      reviewTotalElement.textContent = formatPrice(cart.totalAmount);
    } catch (error) {
      console.error('Error fetching cart:', error);
      alert('Failed to load your cart. Please try again.');
    }
  }
  
  // Place order
  async function placeOrder() {
    try {
      const response = await fetch(`${API_URL}/orders/${user._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ billingInfo: formData })
      });
      
      if (!response.ok) {
        throw new Error('Failed to place order');
      }
      
      const order = await response.json();
      
      // Show order number in confirmation
      if (orderNumberElement) {
        orderNumberElement.textContent = order.order.orderNumber;
      }
      
      // Show step 3
      step1.classList.remove('active');
      step2.classList.remove('active');
      step3.classList.add('active');
      
      // Update step indicators
      stepIndicators[0].classList.add('active');
      stepIndicators[1].classList.add('active');
      stepIndicators[2].classList.add('active');
      
      // Scroll to top
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place your order. Please try again.');
    }
  }
});
