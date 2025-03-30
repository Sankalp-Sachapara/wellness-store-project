// Product detail page functionality
document.addEventListener("DOMContentLoaded", () => {
  const productDetailContainer = document.getElementById("product-detail");

  // Get product ID from URL parameters
  const productId = getUrlParameter("id");

  if (!productId) {
    productDetailContainer.innerHTML =
      '<p class="error-message">Product ID is required. Please go back to the products page.</p>';
    return;
  }

  // Fetch product details
  fetchProductDetail(productId);

  // Fetch product detail
  async function fetchProductDetail(id) {
    try {
      const response = await fetch(`${API_URL}/products/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch product details");
      }

      const product = await response.json();

      const isInCart = await checkIfInCart(id);

      renderProductDetail(product, isInCart);
    } catch (error) {
      console.error("Error fetching product detail:", error);
      productDetailContainer.innerHTML = `<p class="error-message">Error loading product details. Please try again later.</p>`;
    }
  }

  // Render product detail
  function renderProductDetail(product, isInCart) {
    let stockClass = "stock-available";
    let stockText = "In Stock";

    if (product.stock <= 0) {
      stockClass = "stock-unavailable";
      stockText = "Out of Stock";
    } else if (product.stock < 10) {
      stockClass = "stock-low";
      stockText = "Low Stock";
    }

    console.log("isInCart", isInCart);

    const productHTML = `
    <div class="product-detail-container">
      <div class="product-detail-image">
        <img src="${product.imageUrl || "../images/default-product.jpg"}" 
             alt="${product.name}" class="product-detail-img">
      </div>
      <div class="product-detail-info">
        <h1>${product.name}</h1>
        <p class="product-detail-category">
          <i class="fas fa-${getCategoryIcon(product.category)}"></i> 
          ${product.category}
        </p>
        <div class="product-detail-rating">${getStarRating(
          product.rating
        )}</div>
        <p class="product-detail-price">${formatPrice(product.price)}</p>
        <p class="product-detail-description">${product.description}</p>
        <p class="product-detail-stock ${stockClass}">
          <i class="fas fa-${
            product.stock > 0 ? "check-circle" : "times-circle"
          }"></i> 
          ${stockText} ${
      product.stock > 0 ? "(" + product.stock + " available)" : ""
    }
        </p>
        
        ${
          isInCart
            ? `
          <div class="alert alert-success">
            <i class="fas fa-check-circle"></i> This item is already in your cart.
            <div class="cart-actions">
              <a href="cart.html" class="btn btn-sm btn-primary">View Cart</a>
            </div>
          </div>
        `
            : `
          <div class="quantity-container">
            <label for="quantity">Quantity:</label>
            <input type="number" id="quantity" min="1" max="${product.stock}" 
                   value="1" ${product.stock <= 0 ? "disabled" : ""}>
          </div>
          <button id="add-to-cart-btn" data-product-id="${product._id}" 
                  class="btn btn-primary ${
                    product.stock <= 0 ? "disabled" : ""
                  }" 
                  ${product.stock <= 0 ? "disabled" : ""}>
            <i class="fas fa-shopping-cart"></i> Add to Cart
          </button>
        `
        }
        
        <div id="cart-message"></div>
        <a href="products.html" class="btn btn-secondary">
          <i class="fas fa-arrow-left"></i> Back to Products
        </a>
      </div>
    </div>
  `;

    productDetailContainer.innerHTML = productHTML;

    if (!isInCart && product.stock > 0) {
      const addToCartBtn = document.getElementById("add-to-cart-btn");
      const quantityInput = document.getElementById("quantity");

      addToCartBtn.addEventListener("click", () => {
        const quantity = parseInt(quantityInput.value) || 1;
        addToCart(product._id, quantity);
      });
    }
  }

  async function checkIfInCart(productId) {
    const user = checkAuthStatus();
    if (!user) return false;

    try {
      const response = await fetch(`${API_URL}/carts/${user._id}`);
      if (!response.ok) return false;

      const cart = await response.json(); // You need to await and assign the response

      // Check both possible item structures (item._id or item.product._id)
      return cart.items.some(
        (item) =>
          item._id === productId || (item.product && item.product === productId)
      );
    } catch (error) {
      console.error("Error checking cart:", error);
      return false;
    }
  }
  // Function to add product to cart
  async function addToCart(productId, quantity) {
    // Check if user is logged in
    const user = checkAuthStatus();
    if (!user) {
      // Redirect to login if user is not logged in
      window.location.href = `login.html?redirect=product-detail.html?id=${productId}`;
      return;
    }

    // Disable the button during the request
    const addToCartBtn = document.getElementById("add-to-cart-btn");
    const cartMessage = document.getElementById("cart-message");

    addToCartBtn.disabled = true;
    addToCartBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';

    try {
      console.log(
        `Adding product to cart: ${productId} (Quantity: ${quantity})`
      );

      // Make API call to add to cart
      const response = await fetch(`${API_URL}/carts/${user._id}/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      });

      console.log("Response from add to cart:", response);

      if (!response.ok) {
        throw new Error("Failed to add item to cart");
      }

      const cartData = await response.json();

      // Show success message
      cartMessage.innerHTML = `
        <div class="alert alert-success">
          <i class="fas fa-check-circle"></i> Added to cart successfully!
          <div class="cart-actions">
            <a href="cart.html" class="btn btn-sm">View Cart</a>
            <a href="checkout.html" class="btn btn-sm btn-primary">Checkout</a>
          </div>
        </div>
      `;

      // Update cart counter in navbar
      updateCartCounter(cartData.items.length);
    } catch (error) {
      console.error("Error adding to cart:", error);
      cartMessage.innerHTML = `
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-circle"></i> Failed to add item to cart. Please try again.
        </div>
      `;
    } finally {
      // Re-enable the button
      addToCartBtn.disabled = false;
      addToCartBtn.innerHTML =
        '<i class="fas fa-shopping-cart"></i> Add to Cart';
    }
  }

  // Function to update cart counter
  function updateCartCounter(count) {
    let cartCounter = document.getElementById("cart-counter");

    if (!cartCounter) {
      // Create the cart counter if it doesn't exist
      const navButtons = document.querySelector(".nav-buttons");
      if (navButtons) {
        const cartLink = document.createElement("a");
        cartLink.href = "cart.html";
        cartLink.className = "cart-icon";
        cartLink.innerHTML = '<i class="fas fa-shopping-cart"></i>';

        cartCounter = document.createElement("span");
        cartCounter.id = "cart-counter";
        cartCounter.className = "cart-counter";

        cartLink.appendChild(cartCounter);
        navButtons.prepend(cartLink);
      }
    }

    if (cartCounter) {
      cartCounter.textContent = count;
      cartCounter.style.display = count > 0 ? "flex" : "none";
    }
  }

  // Function to show mini cart
  // function showMiniCart(cart) {
  //   // Remove existing mini cart
  //   const existingMiniCart = document.getElementById("mini-cart");
  //   if (existingMiniCart) {
  //     existingMiniCart.remove();
  //   }

  //   // Create mini cart container
  //   const miniCart = document.createElement("div");
  //   miniCart.id = "mini-cart";
  //   miniCart.className = "mini-cart";

  //   // Calculate total
  //   const total =
  //     cart.totalAmount ||
  //     cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  //   // Create mini cart content
  //   let miniCartHTML = `
  //     <div class="mini-cart-header">
  //       <h3>Your Cart (${cart.items.length} items)</h3>
  //       <button class="close-btn" onclick="document.getElementById('mini-cart').remove();">×</button>
  //     </div>
  //     <div class="mini-cart-items">
  //   `;

  //   // Add cart items
  //   if (cart.items.length > 0) {
  //     cart.items.forEach((item) => {
  //       miniCartHTML += `
  //         <div class="mini-cart-item">
  //           <img src="${
  //             item.imageUrl || "../images/default-product.jpg"
  //           }" alt="${item.name}" class="mini-cart-item-img">
  //           <div class="mini-cart-item-details">
  //             <h4>${item.name}</h4>
  //             <p>${formatPrice(item.price)} × ${item.quantity}</p>
  //           </div>
  //         </div>
  //       `;
  //     });
  //   } else {
  //     miniCartHTML += `<p class="empty-cart-message">Your cart is empty.</p>`;
  //   }

  //   miniCartHTML += `
  //     </div>
  //     <div class="mini-cart-footer">
  //       <div class="mini-cart-total">
  //         <p>Total: <span>${formatPrice(total)}</span></p>
  //       </div>
  //       <div class="mini-cart-actions">
  //         <a href="cart.html" class="btn btn-secondary">View Cart</a>
  //         <a href="checkout.html" class="btn btn-primary">Checkout</a>
  //       </div>
  //     </div>
  //   `;

  //   miniCart.innerHTML = miniCartHTML;

  //   // Add mini cart to the page
  //   document.body.appendChild(miniCart);

  //   // Auto-hide mini cart after 5 seconds
  //   setTimeout(() => {
  //     const currentMiniCart = document.getElementById("mini-cart");
  //     if (currentMiniCart) {
  //       currentMiniCart.classList.add("fade-out");
  //       setTimeout(() => {
  //         if (currentMiniCart) {
  //           currentMiniCart.remove();
  //         }
  //       }, 500);
  //     }
  //   }, 5000);
  // }
});
