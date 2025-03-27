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
          <button class="btn btn-primary ${product.stock <= 0 ? 'disabled' : ''}" ${product.stock <= 0 ? 'disabled' : ''}>
            <i class="fas fa-shopping-cart"></i> Add to Cart
          </button>
          <a href="products.html" class="btn btn-secondary"><i class="fas fa-arrow-left"></i> Back to Products</a>
        </div>
      </div>
    `;
    
    productDetailContainer.innerHTML = productHTML;
  }
});
