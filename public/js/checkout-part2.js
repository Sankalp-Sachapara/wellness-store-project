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
