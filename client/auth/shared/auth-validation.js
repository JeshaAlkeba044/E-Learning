/**
 * Shared validation functions for auth forms
 */

// Email validation
export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }
  
  // Password validation
  export function validatePassword(password) {
    return password.length >= 8;
  }
  
  // Show error message
  export function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
  }
  
  // Hide error message
  export function hideError(element) {
    element.textContent = '';
    element.style.display = 'none';
  }
  
  // Toggle password visibility
  export function setupPasswordToggle(inputId, toggleId) {
    const passwordInput = document.getElementById(inputId);
    const toggleCheckbox = document.getElementById(toggleId);
    
    if (passwordInput && toggleCheckbox) {
      toggleCheckbox.addEventListener('change', function() {
        passwordInput.type = this.checked ? 'text' : 'password';
      });
    }
  }