// Checkout page functionality
document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements for checkout steps
  const step1Element = document.getElementById('step-1');
  const step2Element = document.getElementById('step-2');
  const step3Element = document.getElementById('step-3');
  
  const stepElements = document.querySelectorAll('.step');
  
  const billingForm = document.getElementById('billing-form');
  const toReviewBtn = document.getElementById('to-review-btn');
  const backToBillingBtn = document.getElementById('back-to-billing-btn');
  const placeOrderBtn = document.getElementById('place-order-btn');
  
  // Get DOM elements for order review
  const billingDetailsElement = document.getElementById('billing-details');
  const orderItemsElement = document.getElementById('order-items');
  const reviewSubtotalElement = document.getElementById('review-subtotal');
  const reviewTotalElement = document.getElementById('review-total');
  const orderNumberElement = document.getElementById('order-number');
  
  // Form data object
  let billingData = {};
  
  // Cart data
  let cart = null;
  
  // Ensure user is logged in
  const user = checkAuthStatus();
  if (!user) {
    window.location.href = 'login.html?redirect=checkout.html';
    return;
  }
  
  // Initialize checkout
  init();
  
  // Initialize checkout page
  function init() {
    // Fetch cart data
    fetchCart();
    
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
    
    // Fill form with saved user data if available
    fillFormWithUserData();
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
        window.location.href = 'cart.html';
        return;
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      alert('Error loading your cart. Please try again later.');
      window.location.href = 'cart.html';
    }
  }
  
  // Fill form with user data
  function fillFormWithUserData() {
    const savedData = localStorage.getItem('billingData');
    if (savedData) {
      billingData = JSON.parse(savedData);
      
      if (billingData.firstName) document.getElementById('firstName').value = billingData.firstName;
      if (billingData.lastName) document.getElementById('lastName').value = billingData.lastName;
      if (billingData.email) document.getElementById('email').value = billingData.email || user.email;
      if (billingData.phone) document.getElementById('phone').value = billingData.phone;
      if (billingData.address) document.getElementById('address').value = billingData.address;
      if (billingData.city) document.getElementById('city').value = billingData.city;
      if (billingData.state) document.getElementById('state').value = billingData.state;
      if (billingData.zipCode) document.getElementById('zipCode').value = billingData.zipCode;
      if (billingData.country) document.getElementById('country').value = billingData.country;
    } else {
      // If no saved data, at least fill the email
      document.getElementById('email').value = user.email;
    }
  }
  
  // Show step 1 (billing info)
  function goToStep1() {
    step1Element.classList.add('active');
    step2Element.classList.remove('active');
    step3Element.classList.remove('active');
    
    stepElements[0].classList.add('active');
    stepElements[1].classList.remove('active');
    stepElements[2].classList.remove('active');
  }
  
  // Show step 2 (review)
  function goToStep2() {
    step1Element.classList.remove('active');
    step2Element.classList.add('active');
    step3Element.classList.remove('active');
    
    stepElements[0].classList.add('active');
    stepElements[1].classList.add('active');
    stepElements[2].classList.remove('active');
    
    // Populate review section
    populateReview();
  }
  
  // Show step 3 (confirmation)
  function goToStep3(orderNumber) {
    step1Element.classList.remove('active');
    step2Element.classList.remove('active');
    step3Element.classList.add('active');
    
    stepElements[0].classList.add('active');
    stepElements[1].classList.add('active');
    stepElements[2].classList.add('active');
    
    if (orderNumberElement && orderNumber) {
      orderNumberElement.textContent = orderNumber;
    }
  }
  
  // Validate billing info and proceed to review
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
      displayErrorMessage(document.getElementById('zipCode-error'), 'ZIP/Postal Code is required');
      isValid = false;
    }
    
    if (!country) {
      displayErrorMessage(document.getElementById('country-error'), 'Country is required');
      isValid = false;
    }
    
    if (!isValid) return;
    
    // Save billing data
    billingData = {
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
    
    // Save to localStorage for future use
    localStorage.setItem('billingData', JSON.stringify(billingData));
    
    // Go to step 2
    goToStep2();
  }
  
  // Populate review section
  function populateReview() {
    // Populate billing details
    if (billingDetailsElement) {
      billingDetailsElement.innerHTML = `
        <div class="billing-detail"><strong>Name:</strong> ${billingData.firstName} ${billingData.lastName}</div>
        <div class="billing-detail"><strong>Email:</strong> ${billingData.email}</div>
        <div class="billing-detail"><strong>Phone:</strong> ${billingData.phone}</div>
        <div class="billing-detail"><strong>Address:</strong> ${billingData.address}</div>
        <div class="billing-detail"><strong>City:</strong> ${billingData.city}</div>
        <div class="billing-detail"><strong>State/Province:</strong> ${billingData.state}</div>
        <div class="billing-detail"><strong>ZIP/Postal Code:</strong> ${billingData.zipCode}</div>
        <div class="billing-detail"><strong>Country:</strong> ${billingData.country}</div>
      `;
    }
    
    // Populate order items
    if (orderItemsElement && cart && cart.items) {
      let itemsHTML = '';
      
      cart.items.forEach(item => {
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
      
      orderItemsElement.innerHTML = itemsHTML;
    }
    
    // Update totals
    if (reviewSubtotalElement && reviewTotalElement && cart) {
      reviewSubtotalElement.textContent = formatPrice(cart.totalAmount);
      reviewTotalElement.textContent = formatPrice(cart.totalAmount);
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
        body: JSON.stringify({ billingInfo: billingData })
      });
      
      if (!response.ok) {
        throw new Error('Failed to place order');
      }
      
      const orderData = await response.json();
      goToStep3(orderData.order.orderNumber);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  }
});
