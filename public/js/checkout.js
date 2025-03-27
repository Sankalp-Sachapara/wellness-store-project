// Checkout page functionality
document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const billingForm = document.getElementById('billing-form');
  const toReviewBtn = document.getElementById('to-review-btn');
  const backToBillingBtn = document.getElementById('back-to-billing-btn');
  const placeOrderBtn = document.getElementById('place-order-btn');
  const billingDetailsContainer = document.getElementById('billing-details');
  const orderItemsContainer = document.getElementById('order-items');
  const reviewSubtotalElement = document.getElementById('review-subtotal');
  const reviewTotalElement = document.getElementById('review-total');
  const orderNumberElement = document.getElementById('order-number');
  
  // Get step elements
  const step1 = document.getElementById('step-1');
  const step2 = document.getElementById('step-2');
  const step3 = document.getElementById('step-3');
  const stepIndicators = document.querySelectorAll('.step');
  
  // Create object to store billing info
  let billingInfo = {};
  let cart = null;
  
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
    toReviewBtn.addEventListener('click', validateAndContinue);
  }
  
  if (backToBillingBtn) {
    backToBillingBtn.addEventListener('click', goToStep1);
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
      alert('Failed to fetch cart. Please try again.');
    }
  }
  
  // Validate billing form and continue to review
  function validateAndContinue() {
    clearErrorMessages();
    
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const city = document.getElementById('city').value.trim();
    const state = document.getElementById('state').value.trim();
    const zipCode = document.getElementById('zipCode').value.trim();
    const country = document.getElementById('country').value;
    
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
      displayErrorMessage(document.getElementById('zipCode-error'), 'ZIP code is required');
      isValid = false;
    }
    
    if (!country) {
      displayErrorMessage(document.getElementById('country-error'), 'Country is required');
      isValid = false;
    }
    
    if (!isValid) return;
    
    // Store billing info
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
    
    // Go to step 2 (review)
    goToStep2();
  }
  
  // Go to step 1 (billing information)
  function goToStep1() {
    step1.classList.add('active');
    step2.classList.remove('active');
    step3.classList.remove('active');
    
    stepIndicators[0].classList.add('active');
    stepIndicators[1].classList.remove('active');
    stepIndicators[2].classList.remove('active');
  }
  
  // Go to step 2 (review order)
  function goToStep2() {
    step1.classList.remove('active');
    step2.classList.add('active');
    step3.classList.remove('active');
    
    stepIndicators[0].classList.add('active');
    stepIndicators[1].classList.add('active');
    stepIndicators[2].classList.remove('active');
    
    // Display billing info
    const { firstName, lastName, email, phone, address, city, state, zipCode, country } = billingInfo;
    billingDetailsContainer.innerHTML = `
      <div class="billing-detail"><strong>Name:</strong> ${firstName} ${lastName}</div>
      <div class="billing-detail"><strong>Email:</strong> ${email}</div>
      <div class="billing-detail"><strong>Phone:</strong> ${phone}</div>
      <div class="billing-detail"><strong>Address:</strong> ${address}</div>
      <div class="billing-detail"><strong>City:</strong> ${city}</div>
      <div class="billing-detail"><strong>State:</strong> ${state}</div>
      <div class="billing-detail"><strong>ZIP Code:</strong> ${zipCode}</div>
      <div class="billing-detail"><strong>Country:</strong> ${country}</div>
    `;
    
    // Display order items
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
    
    orderItemsContainer.innerHTML = orderItemsHTML;
    
    // Update order summary
    reviewSubtotalElement.textContent = formatPrice(cart.totalAmount);
    reviewTotalElement.textContent = formatPrice(cart.totalAmount);
  }
  
  // Go to step 3 (confirmation)
  function goToStep3(orderNumber) {
    step1.classList.remove('active');
    step2.classList.remove('active');
    step3.classList.add('active');
    
    stepIndicators[0].classList.add('active');
    stepIndicators[1].classList.add('active');
    stepIndicators[2].classList.add('active');
    
    // Display order number
    orderNumberElement.textContent = orderNumber;
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
        body: JSON.stringify({ billingInfo })
      });
      
      if (!response.ok) {
        throw new Error('Failed to place order');
      }
      
      const result = await response.json();
      
      // Go to confirmation step
      goToStep3(result.order.orderNumber);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  }
});
