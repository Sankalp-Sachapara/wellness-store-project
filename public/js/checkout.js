// Checkout page functionality
document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const billingForm = document.getElementById('billing-form');
  const toReviewBtn = document.getElementById('to-review-btn');
  const backToBillingBtn = document.getElementById('back-to-billing-btn');
  const placeOrderBtn = document.getElementById('place-order-btn');
  
  const step1Content = document.getElementById('step-1');
  const step2Content = document.getElementById('step-2');
  const step3Content = document.getElementById('step-3');
  
  const reviewSubtotal = document.getElementById('review-subtotal');
  const reviewTotal = document.getElementById('review-total');
  
  const billingDetails = document.getElementById('billing-details');
  const orderItems = document.getElementById('order-items');
  const orderNumber = document.getElementById('order-number');
  
  const steps = document.querySelectorAll('.step');
  
  // Ensure user is logged in
  const user = checkAuthStatus();
  if (!user) {
    window.location.href = 'login.html?redirect=checkout.html';
    return;
  }
  
  // Initialize the checkout process
  initCheckout();
  
  // Add event listeners
  if (toReviewBtn) {
    toReviewBtn.addEventListener('click', validateBillingAndProceed);
  }
  
  if (backToBillingBtn) {
    backToBillingBtn.addEventListener('click', goToStep1);
  }
  
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', placeOrder);
  }
  
  // Initialize checkout
  async function initCheckout() {
    try {
      // Fetch user's cart
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
      
      // Pre-fill billing information if available
      prefillBillingInfo();
      
      // Show step 1
      goToStep1();
      
    } catch (error) {
      console.error('Error initializing checkout:', error);
      alert('Error loading your cart. Please try again later.');
      window.location.href = 'cart.html';
    }
  }
  
  // Pre-fill billing information from user data
  function prefillBillingInfo() {
    if (user.email) {
      document.getElementById('email').value = user.email;
    }
    
    // Try to get saved billing info from localStorage
    const savedBillingInfo = localStorage.getItem('billingInfo');
    if (savedBillingInfo) {
      const billingInfo = JSON.parse(savedBillingInfo);
      
      document.getElementById('firstName').value = billingInfo.firstName || '';
      document.getElementById('lastName').value = billingInfo.lastName || '';
      document.getElementById('phone').value = billingInfo.phone || '';
      document.getElementById('address').value = billingInfo.address || '';
      document.getElementById('city').value = billingInfo.city || '';
      document.getElementById('state').value = billingInfo.state || '';
      document.getElementById('zipCode').value = billingInfo.zipCode || '';
      document.getElementById('country').value = billingInfo.country || 'USA';
    }
  }
  
  // Validate billing form and proceed to review
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
      displayErrorMessage(document.getElementById('state-error'), 'State is required');
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
    
    if (isValid) {
      // Save billing info to localStorage
      const billingInfo = {
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
      
      localStorage.setItem('billingInfo', JSON.stringify(billingInfo));
      
      // Proceed to review step
      goToStep2(billingInfo);
    }
  }
  
  // Go to billing info step
  function goToStep1() {
    // Update active step
    steps.forEach((step, index) => {
      if (index === 0) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });
    
    // Show step 1 content
    step1Content.classList.add('active');
    step2Content.classList.remove('active');
    step3Content.classList.remove('active');
  }
  
  // Go to review order step
  async function goToStep2(billingInfo) {
    try {
      // Fetch cart data for review
      const response = await fetch(`${API_URL}/carts/${user._id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      
      const cart = await response.json();
      
      if (!cart.items || cart.items.length === 0) {
        window.location.href = 'cart.html';
        return;
      }
      
      // Update active step
      steps.forEach((step, index) => {
        if (index <= 1) {
          step.classList.add('active');
        } else {
          step.classList.remove('active');
        }
      });
      
      // Show step 2 content
      step1Content.classList.remove('active');
      step2Content.classList.add('active');
      step3Content.classList.remove('active');
      
      // Render billing details
      renderBillingDetails(billingInfo);
      
      // Render order items
      renderOrderItems(cart.items);
      
      // Update order summary
      updateOrderSummary(cart.totalAmount);
      
    } catch (error) {
      console.error('Error loading review data:', error);
      alert('Error loading review data. Please try again later.');
    }
  }
  
  // Go to confirmation step
  function goToStep3(orderData) {
    // Update active step
    steps.forEach((step) => {
      step.classList.add('active');
    });
    
    // Show step 3 content
    step1Content.classList.remove('active');
    step2Content.classList.remove('active');
    step3Content.classList.add('active');
    
    // Set order number
    orderNumber.textContent = orderData.orderNumber;
  }
  
  // Render billing details
  function renderBillingDetails(billingInfo) {
    billingDetails.innerHTML = `
      <div class="billing-detail"><strong>Name:</strong> ${billingInfo.firstName} ${billingInfo.lastName}</div>
      <div class="billing-detail"><strong>Email:</strong> ${billingInfo.email}</div>
      <div class="billing-detail"><strong>Phone:</strong> ${billingInfo.phone}</div>
      <div class="billing-detail"><strong>Address:</strong> ${billingInfo.address}</div>
      <div class="billing-detail"><strong>City:</strong> ${billingInfo.city}</div>
      <div class="billing-detail"><strong>State:</strong> ${billingInfo.state}</div>
      <div class="billing-detail"><strong>ZIP/Postal Code:</strong> ${billingInfo.zipCode}</div>
      <div class="billing-detail"><strong>Country:</strong> ${billingInfo.country}</div>
    `;
  }
  
  // Render order items
  function renderOrderItems(items) {
    let itemsHTML = '';
    
    items.forEach(item => {
      itemsHTML += `
        <div class="review-item">
          <img src="${item.imageUrl || 'images/default-product.jpg'}" alt="${item.name}">
          <div class="review-item-info">
            <h4>${item.name}</h4>
            <p>Quantity: ${item.quantity}</p>
            <p>Price: ${formatPrice(item.price)} each</p>
          </div>
          <div class="review-item-price">${formatPrice(item.price * item.quantity)}</div>
        </div>
      `;
    });
    
    orderItems.innerHTML = itemsHTML;
  }
  
  // Update order summary
  function updateOrderSummary(total) {
    reviewSubtotal.textContent = formatPrice(total);
    reviewTotal.textContent = formatPrice(total);
  }
  
  // Place order
  async function placeOrder() {
    try {
      // Get billing info from localStorage
      const billingInfo = JSON.parse(localStorage.getItem('billingInfo'));
      
      if (!billingInfo) {
        alert('Billing information is missing. Please go back and fill out the form.');
        goToStep1();
        return;
      }
      
      // Create order
      const response = await fetch(`${API_URL}/orders/${user._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ billingInfo })
      });
      
      if (!response.ok) {
        throw new Error('Failed to place order');
      }
      
      const orderData = await response.json();
      
      // Show confirmation
      goToStep3(orderData.order);
      
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again later.');
    }
  }
});
// Checkout page functionality - Part 2: Form Validation and Order Placement
// This code extends checkout.js with additional functionality

// Form validation and Billing Information handling
function validateBillingAndContinue() {
  // Get DOM elements - Forms
  const billingForm = document.getElementById('billing-form');
  
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
  
  // Clear previous error messages
  clearErrorMessages();
  
  // Validate form fields
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
  
  // If validation passes, proceed to next step
  if (isValid) {
    // Save billing info
    const billingInfo = {
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
    
    // Store billing info in session storage
    sessionStorage.setItem('billingInfo', JSON.stringify(billingInfo));
    
    // Populate billing details in review step
    populateBillingDetails(billingInfo);
    
    // Show review step
    showStep(2);
  }
}

// Populate billing details in review step
function populateBillingDetails(billingInfo) {
  const billingDetails = document.getElementById('billing-details');
  if (!billingDetails) return;
  
  const html = `
    <div class="billing-detail"><strong>Name:</strong> ${billingInfo.firstName} ${billingInfo.lastName}</div>
    <div class="billing-detail"><strong>Email:</strong> ${billingInfo.email}</div>
    <div class="billing-detail"><strong>Phone:</strong> ${billingInfo.phone}</div>
    <div class="billing-detail"><strong>Address:</strong> ${billingInfo.address}</div>
    <div class="billing-detail"><strong>City:</strong> ${billingInfo.city}</div>
    <div class="billing-detail"><strong>State/Province:</strong> ${billingInfo.state}</div>
    <div class="billing-detail"><strong>ZIP/Postal Code:</strong> ${billingInfo.zipCode}</div>
    <div class="billing-detail"><strong>Country:</strong> ${billingInfo.country}</div>
  `;
  
  billingDetails.innerHTML = html;
}

// Place order
async function placeOrder() {
  // Get user info
  const user = checkAuthStatus();
  if (!user) {
    window.location.href = 'login.html?redirect=checkout.html';
    return;
  }
  
  // Get billing info from session storage
  const billingInfoJson = sessionStorage.getItem('billingInfo');
  if (!billingInfoJson) {
    alert('Billing information is missing. Please fill in your billing details.');
    showStep(1);
    return;
  }
  
  const billingInfo = JSON.parse(billingInfoJson);
  
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
    
    const order = await response.json();
    
    // Show confirmation with order number
    const orderNumber = document.getElementById('order-number');
    if (orderNumber) {
      orderNumber.textContent = order.order.orderNumber;
    }
    
    // Clear billing info from session storage
    sessionStorage.removeItem('billingInfo');
    
    // Show confirmation step
    showStep(3);
  } catch (error) {
    console.error('Error placing order:', error);
    alert('Failed to place order. Please try again.');
  }
}
