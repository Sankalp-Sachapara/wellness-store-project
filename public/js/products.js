// Products page functionality
document.addEventListener('DOMContentLoaded', () => {
  const productsContainer = document.getElementById('products-container');
  const categoryFilter = document.getElementById('category-filter');
  const sortFilter = document.getElementById('sort-filter');
  
  let products = [];
  
  // Check if a category was selected from the URL parameters
  const urlCategory = getUrlParameter('category');
  if (urlCategory) {
    categoryFilter.value = urlCategory;
  }
  
  // Fetch products
  fetchProducts();
  
  // Add event listeners for filters
  categoryFilter.addEventListener('change', filterProducts);
  sortFilter.addEventListener('change', filterProducts);
  
  // Fetch all products or by category
  async function fetchProducts() {
    try {
      const category = categoryFilter.value;
      let url = `${API_URL}/products`;
      
      if (category && category !== 'all') {
        url = `${API_URL}/products/category/${category}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      products = await response.json();
      filterProducts();
    } catch (error) {
      console.error('Error fetching products:', error);
      productsContainer.innerHTML = `<p class="error-message">Error loading products. Please try again later.</p>`;
    }
  }
  
  // Filter and sort products
  function filterProducts() {
    if (!products.length) {
      productsContainer.innerHTML = '<p>No products found.</p>';
      return;
    }
    
    const category = categoryFilter.value;
    const sortOption = sortFilter.value;
    
    // Filter by category if not already filtered by API
    let filteredProducts = [...products];
    if (category !== 'all' && !window.location.search.includes('category=')) {
      filteredProducts = products.filter(product => product.category === category);
    }
    
    // Sort products
    switch (sortOption) {
      case 'price-low':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'name-az':
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-za':
        filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'rating':
        filteredProducts.sort((a, b) => b.rating - a.rating);
        break;
    }
    
    // Render products
    renderProducts(filteredProducts);
  }
  
  // Render products
  function renderProducts(products) {
    if (!products.length) {
      productsContainer.innerHTML = '<p>No products found matching your criteria.</p>';
      return;
    }
    
    let productsHTML = '';
    
    products.forEach(product => {
      productsHTML += createProductCard(product);
    });
    
    productsContainer.innerHTML = productsHTML;
  }
});
