// Checkout page functionality
document.addEventListener('DOMContentLoaded', () => {
  // Steps containers
  const step1 = document.getElementById('step-1');
  const step2 = document.getElementById('step-2');
  const step3 = document.getElementById('step-3');
  
  // Step indicators
  const stepIndicators = document.querySelectorAll('.step');
  
  // Form elements and buttons
  const billingForm = document.getElementById('billing-form');
  const toReviewBtn = document.getElementById('to-review-btn');
  const backToBillingBtn = document.getElementById('back-to-billing-btn');
  const placeOrderBtn = document.getElementById('place-order-btn');
  
  // Review sections
  const billingDetails = document.getElementById('billing-details');
  const orderItems = document.getElementById('order-items');
  const reviewSubtotal = document.getElementById('review-subtotal');
  const reviewTotal = document.getElementById('review-total');
  const orderNumber = document.getElementById('order-number');
  
  // Check if user is logged in
  const user = checkAuthStatus();
  if (!user) {
    window.location.href = 'login.html?redirect=checkout.html';
    return;
  }
  
  // Check if user has items in cart
  checkCartItems();
  
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
  
  // Check if cart has items
  async function checkCartItems() {
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
      
      // Store cart data for later use
      sessionStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error checking cart:', error);
      alert('Failed to load cart data. Please try again.');
      window.location.href = 'cart.html';
    }
  }
  
  // Go to review step
  function goToReview() {
    // Validate billing form
    if (!validateBillingForm()) {
      return;
    }
    
    // Store billing info in session
    storeBillingInfo();
    
    // Show review step
    showStep(2);
    
    // Render review data
    renderReviewData();
  }
  
  // Go back to billing step
  function goToBilling() {
    showStep(1);
  }
  
  // Show specified step
  function showStep(stepNumber) {
    // Hide all steps
    step1.classList.remove('active');
    step2.classList.remove('active');
    step3.classList.remove('active');
    
    // Update step indicators
    stepIndicators.forEach((indicator, index) => {
      if (index < stepNumber) {
        indicator.classList.add('active');
      } else {
        indicator.classList.remove('active');
      }
    });
    
    // Show current step
    if (stepNumber === 1) {
      step1.classList.add('active');
    } else if (stepNumber === 2) {
      step2.classList.add('active');
    } else if (stepNumber === 3) {
      step3.classList.add('active');
    }
  }
  
  // Validate billing form
  function validateBillingForm() {
    clearErrorMessages();
    
    let isValid = true;
    
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
    
    // Validate fields
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
    
    return isValid;
  }
  
  // Store billing info in session storage
  function storeBillingInfo() {
    const billingInfo = {
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
    
    sessionStorage.setItem('billingInfo', JSON.stringify(billingInfo));
  }
  
  // Render review data
  function renderReviewData() {
    // Get billing info and cart data from session
    const billingInfo = JSON.parse(sessionStorage.getItem('billingInfo'));
    const cart = JSON.parse(sessionStorage.getItem('cart'));
    
    if (!billingInfo || !cart) {
      alert('Failed to load checkout data. Please try again.');
      window.location.href = 'cart.html';
      return;
    }
    
    // Render billing details
    const billingHTML = `
      <div class="billing-detail"><strong>Name:</strong> ${billingInfo.firstName} ${billingInfo.lastName}</div>
      <div class="billing-detail"><strong>Email:</strong> ${billingInfo.email}</div>
      <div class="billing-detail"><strong>Phone:</strong> ${billingInfo.phone}</div>
      <div class="billing-detail"><strong>Address:</strong> ${billingInfo.address}</div>
      <div class="billing-detail"><strong>City:</strong> ${billingInfo.city}</div>
      <div class="billing-detail"><strong>State/Province:</strong> ${billingInfo.state}</div>
      <div class="billing-detail"><strong>ZIP/Postal Code:</strong> ${billingInfo.zipCode}</div>
      <div class="billing-detail"><strong>Country:</strong> ${billingInfo.country}</div>
    `;
    
    billingDetails.innerHTML = billingHTML;
    
    // Render order items
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
    
    orderItems.innerHTML = itemsHTML;
    
    // Update totals
    reviewSubtotal.textContent = formatPrice(cart.totalAmount);
    reviewTotal.textContent = formatPrice(cart.totalAmount);
  }
  
  // Place order
  async function placeOrder() {
    try {
      const billingInfo = JSON.parse(sessionStorage.getItem('billingInfo'));
      
      if (!billingInfo) {
        alert('Billing information is missing. Please try again.');
        goToBilling();
        return;
      }
      
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
      
      const order = await response.json();
      
      // Show confirmation step
      showStep(3);
      
      // Display order number
      if (orderNumber) {
        orderNumber.textContent = order.order.orderNumber;
      }
      
      // Clear session storage
      sessionStorage.removeItem('billingInfo');
      sessionStorage.removeItem('cart');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  }
});
