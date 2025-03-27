// Checkout page functionality
document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const step1Element = document.getElementById('step-1');
  const step2Element = document.getElementById('step-2');
  const step3Element = document.getElementById('step-3');
  const stepElements = document.querySelectorAll('.step');
  
  const billingForm = document.getElementById('billing-form');
  const toReviewBtn = document.getElementById('to-review-btn');
  const backToBillingBtn = document.getElementById('back-to-billing-btn');
  const placeOrderBtn = document.getElementById('place-order-btn');
  
  const billingDetailsElement = document.getElementById('billing-details');
  const orderItemsElement = document.getElementById('order-items');
  const reviewSubtotalElement = document.getElementById('review-subtotal');
  const reviewTotalElement = document.getElementById('review-total');
  const orderNumberElement = document.getElementById('order-number');
  
  // Billing information object
  let billingInfo = {};
  let cart = {};
  
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
    toReviewBtn.addEventListener('click', validateBillingAndProceed);
  }
  
  if (backToBillingBtn) {
    backToBillingBtn.addEventListener('click', goBackToBilling);
  }
  
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', placeOrder);
  }
  
  // Fetch user's cart
  async function fetchCart() {
    try {
      const response = await fetch(`${API_URL}/carts/${user._id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      
      cart = await response.json();
      
      if (!cart.items || cart.items.length === 0) {
        // Redirect to cart page if cart is empty
        window.location.href = 'cart.html';
        return;
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      alert('Error loading cart data. Please try again.');
    }
  }
  
  // Validate billing information and proceed to review
  function validateBillingAndProceed() {
    // Clear previous error messages
    clearErrorMessages();
    
    // Get form values
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const city = document.getElementById('city').value.trim();
    const state = document.getElementById('state').value.trim();
    const zipCode = document.getElementById('zipCode').value.trim();
    const country = document.getElementById('country').value;
    
    // Validate inputs
    let isValid = true;
    
    if (!firstName) {
      displayErrorMessage(document.getElementById('firstName-error'), 'First name is required');
      isValid = false;
    }
    
    if (!lastName) {
      displayErrorMessage(document.getElementById('lastName-error'), 'Last name is required');
      isValid = false;
    }
    
    if (!email) {
      displayErrorMessage(document.getElementById('email-error'), 'Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      displayErrorMessage(document.getElementById('email-error'), 'Please enter a valid email address');
      isValid = false;
    }
    
    if (!phone) {
      displayErrorMessage(document.getElementById('phone-error'), 'Phone number is required');
      isValid = false;
    }
    
    if (!address) {
      displayErrorMessage(document.getElementById('address-error'), 'Address is required');
      isValid = false;
    }
    
    if (!city) {
      displayErrorMessage(document.getElementById('city-error'), 'City is required');
      isValid = false;
    }
    
    if (!state) {
      displayErrorMessage(document.getElementById('state-error'), 'State/Province is required');
      isValid = false;
    }
    
    if (!zipCode) {
      displayErrorMessage(document.getElementById('zipCode-error'), 'ZIP/Postal code is required');
      isValid = false;
    }
    
    if (!country) {
      displayErrorMessage(document.getElementById('country-error'), 'Country is required');
      isValid = false;
    }
    
    if (!isValid) return;
    
    // Save billing information
    billingInfo = {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      country
    };
    
    // Proceed to review step
    goToReviewStep();
  }
  
  // Go to review step
  function goToReviewStep() {
    // Update steps
    stepElements[0].classList.remove('active');
    stepElements[1].classList.add('active');
    
    // Hide step 1, show step 2
    step1Element.classList.remove('active');
    step2Element.classList.add('active');
    
    // Render review information
    renderBillingDetails();
    renderOrderItems();
  }
  
  // Go back to billing step
  function goBackToBilling() {
    // Update steps
    stepElements[1].classList.remove('active');
    stepElements[0].classList.add('active');
    
    // Hide step 2, show step 1
    step2Element.classList.remove('active');
    step1Element.classList.add('active');
  }
  
  // Render billing details
  function renderBillingDetails() {
    let billingHTML = `
      <div class="billing-detail"><strong>Name:</strong> ${billingInfo.firstName} ${billingInfo.lastName}</div>
      <div class="billing-detail"><strong>Email:</strong> ${billingInfo.email}</div>
      <div class="billing-detail"><strong>Phone:</strong> ${billingInfo.phone}</div>
      <div class="billing-detail"><strong>Address:</strong> ${billingInfo.address}</div>
      <div class="billing-detail"><strong>City:</strong> ${billingInfo.city}</div>
      <div class="billing-detail"><strong>State/Province:</strong> ${billingInfo.state}</div>
      <div class="billing-detail"><strong>ZIP/Postal Code:</strong> ${billingInfo.zipCode}</div>
      <div class="billing-detail"><strong>Country:</strong> ${billingInfo.country}</div>
    `;
    
    billingDetailsElement.innerHTML = billingHTML;
  }
  
  // Render order items
  function renderOrderItems() {
    if (!cart.items || cart.items.length === 0) {
      orderItemsElement.innerHTML = '<p>No items in cart.</p>';
      reviewSubtotalElement.textContent = formatPrice(0);
      reviewTotalElement.textContent = formatPrice(0);
      return;
    }
    
    let itemsHTML = '';
    
    cart.items.forEach(item => {
      itemsHTML += `
        <div class="review-item">
          <img src="${item.imageUrl || 'images/default-product.jpg'}" alt="${item.name}">
          <div class="review-item-info">
            <h4>${item.name}</h4>
            <p>Quantity: ${item.quantity}</p>
          </div>
          <div class="review-item-price">
            ${formatPrice(item.price * item.quantity)}
          </div>
        </div>
      `;
    });
    
    orderItemsElement.innerHTML = itemsHTML;
    reviewSubtotalElement.textContent = formatPrice(cart.totalAmount);
    reviewTotalElement.textContent = formatPrice(cart.totalAmount);
  }
  
  // Place order
  async function placeOrder() {
    try {
      const orderData = {
        billingInfo
      };
      
      const response = await fetch(`${API_URL}/orders/${user._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to place order');
      }
      
      const order = await response.json();
      
      // Go to confirmation step
      goToConfirmationStep(order);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  }
  
  // Go to confirmation step
  function goToConfirmationStep(order) {
    // Update steps
    stepElements[1].classList.remove('active');
    stepElements[2].classList.add('active');
    
    // Hide step 2, show step 3
    step2Element.classList.remove('active');
    step3Element.classList.add('active');
    
    // Set order number
    orderNumberElement.textContent = order.order.orderNumber;
  }
});
