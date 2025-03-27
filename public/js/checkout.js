// Checkout page functionality - Part 1: Initialization and Navigation
document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements - Steps
  const billingStep = document.getElementById('step-1');
  const reviewStep = document.getElementById('step-2');
  const confirmationStep = document.getElementById('step-3');
  
  // Get DOM elements - Navigation
  const toBillingBtn = document.getElementById('back-to-billing-btn');
  const toReviewBtn = document.getElementById('to-review-btn');
  const placeOrderBtn = document.getElementById('place-order-btn');
  
  // Get DOM elements - Forms
  const billingForm = document.getElementById('billing-form');
  
  // Get DOM elements - Review
  const billingDetails = document.getElementById('billing-details');
  const orderItems = document.getElementById('order-items');
  const reviewSubtotal = document.getElementById('review-subtotal');
  const reviewTotal = document.getElementById('review-total');
  
  // Get DOM elements - Confirmation
  const orderNumber = document.getElementById('order-number');
  
  // Ensure user is logged in
  const user = checkAuthStatus();
  if (!user) {
    window.location.href = 'login.html?redirect=checkout.html';
    return;
  }
  
  // Initialize - Show step 1 (Billing)
  showStep(1);
  
  // Fetch cart data
  fetchCart();
  
  // Add event listeners for navigation
  if (toReviewBtn) {
    toReviewBtn.addEventListener('click', validateBillingAndContinue);
  }
  
  if (toBillingBtn) {
    toBillingBtn.addEventListener('click', () => showStep(1));
  }
  
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', placeOrder);
  }
  
  // Step management
  function showStep(stepNumber) {
    // Hide all steps
    billingStep.classList.remove('active');
    reviewStep.classList.remove('active');
    confirmationStep.classList.remove('active');
    
    // Show appropriate step
    if (stepNumber === 1) {
      billingStep.classList.add('active');
      updateStepIndicators(1);
    } else if (stepNumber === 2) {
      reviewStep.classList.add('active');
      updateStepIndicators(2);
    } else if (stepNumber === 3) {
      confirmationStep.classList.add('active');
      updateStepIndicators(3);
    }
  }
  
  // Update step indicators in the UI
  function updateStepIndicators(activeStep) {
    const stepElements = document.querySelectorAll('.step');
    
    stepElements.forEach((step, index) => {
      if (index + 1 <= activeStep) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
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
        alert('Your cart is empty. Please add items to your cart before checkout.');
        window.location.href = 'cart.html';
        return;
      }
      
      // Populate review items
      populateReviewItems(cart);
    } catch (error) {
      console.error('Error fetching cart:', error);
      alert('Error loading cart. Please try again later.');
    }
  }
  
  // Populate review items from cart
  function populateReviewItems(cart) {
    if (!orderItems) return;
    
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
    if (reviewSubtotal && reviewTotal) {
      reviewSubtotal.textContent = formatPrice(cart.totalAmount);
      reviewTotal.textContent = formatPrice(cart.totalAmount);
    }
  }
}); // End of Part 1