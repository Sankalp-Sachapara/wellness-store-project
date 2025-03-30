// Admin page functionality
document.addEventListener('DOMContentLoaded', () => {
  // Check if user is admin
  const user = checkAuthStatus();
  if (!user || !user.isAdmin) {
    window.location.href = '../login.html'; // Fixed the path from /login.html to ../login.html
    return;
  }
  
  // Elements for product management
  const productsList = document.getElementById('products-list');
  const productForm = document.getElementById('product-form');
  const productModal = document.getElementById('product-modal');
  const deleteModal = document.getElementById('delete-modal');
  const modalTitle = document.getElementById('modal-title');
  const addProductBtn = document.getElementById('add-product-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const closeModalBtns = document.querySelectorAll('.close');
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
  const productSearch = document.getElementById('product-search');
  const categoryFilter = document.getElementById('category-filter');
  
  let products = [];
  let currentProductId = null;
  
  // Fetch products if products list exists
  if (productsList) {
    fetchProducts();
    
    // Add event listeners
    addProductBtn.addEventListener('click', showAddProductModal);
    cancelBtn.addEventListener('click', closeProductModal);
    productForm.addEventListener('submit', handleProductSubmit);
    confirmDeleteBtn.addEventListener('click', handleDeleteProduct);
    cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    closeModalBtns.forEach(btn => btn.addEventListener('click', function() {
      closeProductModal();
      closeDeleteModal();
    }));
    
    // Filter and search
    if (productSearch) {
      productSearch.addEventListener('input', filterProducts);
    }
    
    if (categoryFilter) {
      categoryFilter.addEventListener('change', filterProducts);
    }
  }
  
  // Fetch all products
  async function fetchProducts() {
    try {
      const response = await fetch(`${API_URL}/products`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      products = await response.json();
      renderProducts(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      productsList.innerHTML = `<tr><td colspan="7" class="error-message">Error loading products. Please try again later.</td></tr>`;
    }
  }
  
  // Render products in table
  function renderProducts(productsToRender) {
    if (!productsToRender.length) {
      productsList.innerHTML = '<tr><td colspan="7">No products found.</td></tr>';
      return;
    }
    
    let productsHTML = '';
    
    productsToRender.forEach(product => {
      productsHTML += `
        <tr>
          <td>${product._id}</td>
          <td><img src="${product.imageUrl || '../images/default-product.jpg'}" alt="${product.name}"></td>
          <td>${product.name}</td>
          <td>${product.category}</td>
          <td>${formatPrice(product.price)}</td>
          <td>${product.stock}</td>
          <td class="action-buttons">
            <button class="action-btn view-btn" onclick="window.open('../product-detail.html?id=${product._id}', '_blank')">
              <i class="fas fa-eye"></i>
            </button>
            <button class="action-btn edit-btn" data-id="${product._id}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete-btn" data-id="${product._id}">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    });
    
    productsList.innerHTML = productsHTML;
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = btn.getAttribute('data-id');
        showEditProductModal(productId);
      });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = btn.getAttribute('data-id');
        showDeleteConfirmation(productId);
      });
    });
  }
  
  // Filter products
  function filterProducts() {
    const searchTerm = productSearch ? productSearch.value.toLowerCase() : '';
    const category = categoryFilter ? categoryFilter.value : 'all';
    
    let filteredProducts = [...products];
    
    // Filter by search term
    if (searchTerm) {
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) || 
        product._id.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filter by category
    if (category !== 'all') {
      filteredProducts = filteredProducts.filter(product => product.category === category);
    }
    
    renderProducts(filteredProducts);
  }
  
  // Show add product modal
  function showAddProductModal() {
    modalTitle.textContent = 'Add New Product';
    productForm.reset();
    document.getElementById('product-id').value = '';
    currentProductId = null;
    openProductModal();
  }
  
  // Show edit product modal
  function showEditProductModal(productId) {
    const product = products.find(p => p._id === productId);
    
    if (!product) return;
    
    modalTitle.textContent = 'Edit Product';
    
    document.getElementById('product-id').value = product._id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-description').value = product.description;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-stock').value = product.stock;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-image').value = product.imageUrl || '';
    
    currentProductId = productId;
    openProductModal();
  }
  
  // Open product modal
  function openProductModal() {
    productModal.style.display = 'block';
    clearErrorMessages();
  }
  
  // Close product modal
  function closeProductModal() {
    productModal.style.display = 'none';
  }
  
  // Show delete confirmation
  function showDeleteConfirmation(productId) {
    currentProductId = productId;
    deleteModal.style.display = 'block';
  }
  
  // Close delete modal
  function closeDeleteModal() {
    deleteModal.style.display = 'none';
  }
  
  // Handle product form submit
  async function handleProductSubmit(e) {
    e.preventDefault();
    
    // Clear previous error messages
    clearErrorMessages();
    
    // Get form values
    const name = document.getElementById('product-name').value.trim();
    const description = document.getElementById('product-description').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const stock = parseInt(document.getElementById('product-stock').value);
    const category = document.getElementById('product-category').value;
    const imageUrl = document.getElementById('product-image').value.trim();
    
    // Validate inputs
    let isValid = true;
    
    if (!name) {
      displayErrorMessage(document.getElementById('name-error'), 'Product name is required');
      isValid = false;
    }
    
    if (!description) {
      displayErrorMessage(document.getElementById('description-error'), 'Description is required');
      isValid = false;
    }
    
    if (isNaN(price) || price < 0) {
      displayErrorMessage(document.getElementById('price-error'), 'Please enter a valid price');
      isValid = false;
    }
    
    if (isNaN(stock) || stock < 0) {
      displayErrorMessage(document.getElementById('stock-error'), 'Please enter a valid stock quantity');
      isValid = false;
    }
    
    if (!category) {
      displayErrorMessage(document.getElementById('category-error'), 'Please select a category');
      isValid = false;
    }
    
    if (!isValid) return;
    
    const productData = {
      name,
      description,
      price,
      stock,
      category,
      imageUrl: imageUrl || undefined
    };
    
    try {
      let response;
      
      if (currentProductId) {
        // Update existing product
        response = await fetch(`${API_URL}/products/${currentProductId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(productData)
        });
      } else {
        // Create new product
        response = await fetch(`${API_URL}/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(productData)
        });
      }
      
      if (!response.ok) {
        throw new Error('Failed to save product');
      }
      
      // Close modal and refresh products
      closeProductModal();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('An error occurred while saving the product. Please try again.');
    }
  }
  
  // Handle delete product
  async function handleDeleteProduct() {
    if (!currentProductId) return;
    
    try {
      const response = await fetch(`${API_URL}/products/${currentProductId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      
      // Close modal and refresh products
      closeDeleteModal();
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('An error occurred while deleting the product. Please try again.');
    }
  }
});
