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
  
  // Track current step
  let currentStep = 1;
  
  // Track billing information
  let billingInfo = {};
  
  // Ensure user is logged in
  const user = checkAuthStatus();
  if (!user) {
    window.location.href = 'login.html?redirect=checkout.html';
    return;
  }
  
  // Check if cart is empty
  checkCart();
  
  // Add event listeners
  if (toReviewBtn) {
    toReviewBtn.addEventListener('click', proceedToReview);
  }
  
  if (backToBillingBtn) {
    backToBillingBtn.addEventListener('click', goBackToBilling);
  }
  
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', placeOrder);
  }
  
  // Check if cart is empty
  async function checkCart() {
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
    } catch (error) {
      console.error('Error checking cart:', error);
      alert('Failed to check cart. Please try again.');
    }
  }
  
  // Proceed to review step
  function proceedToReview() {
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
    
    // Display billing information
    displayBillingInfo();
    
    // Fetch and display cart items
    fetchCartForReview();
    
    // Go to next step
    goToStep(2);
  }
  
  // Validate billing form
  function validateBillingForm() {
    clearErrorMessages();
    
    let isValid = true;
    
    // First Name validation
    const firstName = document.getElementById('firstName').value.trim();
    if (!firstName) {
      displayErrorMessage(document.getElementById('firstName-error'), 'First name is required');
      isValid = false;
    }
    
    // Last Name validation
    const lastName = document.getElementById('lastName').value.trim();
    if (!lastName) {
      displayErrorMessage(document.getElementById('lastName-error'), 'Last name is required');
      isValid = false;
    }
    
    // Email validation
    const email = document.getElementById('email').value.trim();
    if (!email) {
      displayErrorMessage(document.getElementById('email-error'), 'Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      displayErrorMessage(document.getElementById('email-error'), 'Please enter a valid email address');
      isValid = false;
    }
    
    // Phone validation
    const phone = document.getElementById('phone').value.trim();
    if (!phone) {
      displayErrorMessage(document.getElementById('phone-error'), 'Phone number is required');
      isValid = false;
    }
    
    // Address validation
    const address = document.getElementById('address').value.trim();
    if (!address) {
      displayErrorMessage(document.getElementById('address-error'), 'Address is required');
      isValid = false;
    }
    
    // City validation
    const city = document.getElementById('city').value.trim();
    if (!city) {
      displayErrorMessage(document.getElementById('city-error'), 'City is required');
      isValid = false;
    }
    
    // State validation
    const state = document.getElementById('state').value.trim();
    if (!state) {
      displayErrorMessage(document.getElementById('state-error'), 'State is required');
      isValid = false;
    }
    
    // ZIP Code validation
    const zipCode = document.getElementById('zipCode').value.trim();
    if (!zipCode) {
      displayErrorMessage(document.getElementById('zipCode-error'), 'ZIP code is required');
      isValid = false;
    }
    
    // Country validation
    const country = document.getElementById('country').value;
    if (!country) {
      displayErrorMessage(document.getElementById('country-error'), 'Country is required');
      isValid = false;
    }
    
    return isValid;
  }
  
  // Display billing information
  function displayBillingInfo() {
    billingDetailsElement.innerHTML = `
      <div class="billing-detail"><strong>Name:</strong> ${billingInfo.firstName} ${billingInfo.lastName}</div>
      <div class="billing-detail"><strong>Email:</strong> ${billingInfo.email}</div>
      <div class="billing-detail"><strong>Phone:</strong> ${billingInfo.phone}</div>
      <div class="billing-detail"><strong>Address:</strong> ${billingInfo.address}</div>
      <div class="billing-detail"><strong>City:</strong> ${billingInfo.city}</div>
      <div class="billing-detail"><strong>State:</strong> ${billingInfo.state}</div>
      <div class="billing-detail"><strong>ZIP Code:</strong> ${billingInfo.zipCode}</div>
      <div class="billing-detail"><strong>Country:</strong> ${billingInfo.country}</div>
    `;
  }
  
  // Fetch cart for review
  async function fetchCartForReview() {
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
      
      // Display cart items
      displayOrderItems(cart.items);
      
      // Update totals
      reviewSubtotalElement.textContent = formatPrice(cart.totalAmount);
      reviewTotalElement.textContent = formatPrice(cart.totalAmount);
    } catch (error) {
      console.error('Error fetching cart:', error);
      alert('Failed to fetch cart. Please try again.');
    }
  }
  
  // Display order items
  function displayOrderItems(items) {
    let itemsHTML = '';
    
    items.forEach(item => {
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
  
  // Go back to billing step
  function goBackToBilling() {
    goToStep(1);
  }
  
  // Place order
  async function placeOrder() {
    try {
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
      
      // Display order number
      if (orderData.order && orderData.order.orderNumber) {
        orderNumberElement.textContent = orderData.order.orderNumber;
      } else {
        orderNumberElement.textContent = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
      }
      
      // Go to confirmation step
      goToStep(3);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  }
  
  // Go to specific step
  function goToStep(step) {
    currentStep = step;
    
    // Hide all steps
    step1Element.classList.remove('active');
    step2Element.classList.remove('active');
    step3Element.classList.remove('active');
    
    // Remove active class from all step indicators
    stepElements.forEach((element, index) => {
      element.classList.remove('active');
      
      // Add active class to current and previous steps
      if (index < step) {
        element.classList.add('active');
      }
    });
    
    // Show current step
    if (step === 1) {
      step1Element.classList.add('active');
    } else if (step === 2) {
      step2Element.classList.add('active');
    } else if (step === 3) {
      step3Element.classList.add('active');
    }
  }
});
