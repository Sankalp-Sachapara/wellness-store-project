// Home page functionality
document.addEventListener('DOMContentLoaded', () => {
  const featuredProductsContainer = document.getElementById('featured-products');
  
  // Fetch featured products
  fetchFeaturedProducts();
  
  // Fetch featured products (top rated products)
  async function fetchFeaturedProducts() {
    try {
      const response = await fetch(`${API_URL}/products`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const products = await response.json();
      
      // Sort by rating and get top 4
      const featuredProducts = products
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4);
      
      renderFeaturedProducts(featuredProducts);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      featuredProductsContainer.innerHTML = `<p class="error-message">Error loading featured products. Please try again later.</p>`;
    }
  }
  
  // Render featured products
  function renderFeaturedProducts(products) {
    if (!products.length) {
      featuredProductsContainer.innerHTML = '<p>No featured products available.</p>';
      return;
    }
    
    let productsHTML = '';
    
    products.forEach(product => {
      productsHTML += createProductCard(product);
    });
    
    featuredProductsContainer.innerHTML = productsHTML;
  }
});
