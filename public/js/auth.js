// Authentication functionality
document.addEventListener('DOMContentLoaded', () => {
  // Login form handling
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Register form handling
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
  
  // Login handler
  async function handleLogin(e) {
    e.preventDefault();
    
    // Clear previous error messages
    clearErrorMessages();
    
    // Get form values
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const formMessage = document.getElementById('form-message');
    
    // Validate inputs
    let isValid = true;
    
    if (!email) {
      displayErrorMessage(document.getElementById('email-error'), 'Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      displayErrorMessage(document.getElementById('email-error'), 'Please enter a valid email address');
      isValid = false;
    }
    
    if (!password) {
      displayErrorMessage(document.getElementById('password-error'), 'Password is required');
      isValid = false;
    }
    
    if (!isValid) return;
    
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Store user data in local storage
      localStorage.setItem('user', JSON.stringify(data));
      
      // Redirect based on user role
      if (data.isAdmin) {
        window.location.href = '/admin/index.html';
      } else {
        window.location.href = '/index.html';
      }
    } catch (error) {
      formMessage.textContent = error.message;
      formMessage.style.color = 'var(--error-color)';
    }
  }
  
  // Register handler
  async function handleRegister(e) {
    e.preventDefault();
    
    // Clear previous error messages
    clearErrorMessages();
    
    // Get form values
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const formMessage = document.getElementById('form-message');
    
    // Validate inputs
    let isValid = true;
    
    if (!username) {
      displayErrorMessage(document.getElementById('username-error'), 'Username is required');
      isValid = false;
    }
    
    if (!email) {
      displayErrorMessage(document.getElementById('email-error'), 'Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      displayErrorMessage(document.getElementById('email-error'), 'Please enter a valid email address');
      isValid = false;
    }
    
    if (!password) {
      displayErrorMessage(document.getElementById('password-error'), 'Password is required');
      isValid = false;
    } else if (!validatePassword(password)) {
      displayErrorMessage(document.getElementById('password-error'), 'Password must be at least 6 characters');
      isValid = false;
    }
    
    if (password !== confirmPassword) {
      displayErrorMessage(document.getElementById('confirm-password-error'), 'Passwords do not match');
      isValid = false;
    }
    
    if (!isValid) return;
    
    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Store user data in local storage
      localStorage.setItem('user', JSON.stringify(data));
      
      // Show success message
      formMessage.textContent = 'Registration successful! Redirecting...';
      formMessage.style.color = 'var(--primary-color)';
      
      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = '/index.html';
      }, 1500);
    } catch (error) {
      formMessage.textContent = error.message;
      formMessage.style.color = 'var(--error-color)';
    }
  }
});
