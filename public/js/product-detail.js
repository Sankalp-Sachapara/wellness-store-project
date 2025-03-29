// Product detail page functionality
document.addEventListener('DOMContentLoaded', () => {
  const productDetailContainer = document.getElementById('product-detail');
  
  // Get product ID from URL parameters
  const productId = getUrlParameter('id');
  
  if (!productId) {
    productDetailContainer.innerHTML = '<p class="error-message">Product ID is required. Please go back to the products page.</p>';
    return;
  }
  
  // Fetch product details
  fetchProductDetail(productId);
  
  // Fetch product detail
  async function fetchProductDetail(id) {
    try {
      const response = await fetch(`${API_URL}/products/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch product details');
      }
      
      const product = await response.json();
      renderProductDetail(product);
    } catch (error) {
      console.error('Error fetching product detail:', error);
      productDetailContainer.innerHTML = `<p class="error-message">Error loading product details. Please try again later.</p>`;
    }
  }
  
  // Render product detail
  function renderProductDetail(product) {
    let stockClass = 'stock-available';
    let stockText = 'In Stock';
    
    if (product.stock <= 0) {
      stockClass = 'stock-unavailable';
      stockText = 'Out of Stock';
    } else if (product.stock < 10) {
      stockClass = 'stock-low';
      stockText = 'Low Stock';
    }
    
    const productHTML = `
      <div class="product-detail-container">
        <div class="product-detail-image">
          <img src="${product.imageUrl || '../images/default-product.jpg'}" alt="${product.name}" class="product-detail-img">
        </div>
        <div class="product-detail-info">
          <h1>${product.name}</h1>
          <p class="product-detail-category"><i class="fas fa-${getCategoryIcon(product.category)}"></i> ${product.category}</p>
          <div class="product-detail-rating">${getStarRating(product.rating)}</div>
          <p class="product-detail-price">${formatPrice(product.price)}</p>
          <p class="product-detail-description">${product.description}</p>
          <p class="product-detail-stock ${stockClass}"><i class="fas fa-${product.stock > 0 ? 'check-circle' : 'times-circle'}"></i> ${stockText} ${product.stock > 0 ? '(' + product.stock + ' available)' : ''}</p>
          <button id="add-to-cart-btn" class="btn btn-primary ${product.stock <= 0 ? 'disabled' : ''}" ${product.stock <= 0 ? 'disabled' : ''}>
            <i class="fas fa-shopping-cart"></i> Add to Cart
          </button>
          <a href="products.html" class="btn btn-secondary"><i class="fas fa-arrow-left"></i> Back to Products</a>
        </div>
      </div>
    `;
    
    productDetailContainer.innerHTML = productHTML;
    
    // Add event listener to the Add to Cart button
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    if (addToCartBtn && product.stock > 0) {
      addToCartBtn.addEventListener('click', () => {
        addToCart(product._id);
      });
    }
  }
  
  // Function to add product to cart
  async function addToCart(productId) {
    // Check if user is logged in
    const user = checkAuthStatus();
    if (!user) {
      // Redirect to login if user is not logged in
      window.location.href = `login.html?redirect=product-detail.html?id=${productId}`;
      return;
    }
    
    try {
      // Set quantity (default to 1)
      const quantity = 1;
      
      console.log(`Adding product to cart: ${productId}`);
      
      // Make API call to add to cart
      const response = await fetch(`${API_URL}/carts/${user._id}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId,
          quantity
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }
      
      // Show success message
      alert('Product added to cart successfully!');
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    }
  }
});
