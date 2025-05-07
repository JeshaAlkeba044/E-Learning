import { 
    validateEmail, 
    validatePassword, 
    showError, 
    hideError,
    setupPasswordToggle 
  } from '../shared/auth-validation.js';
  import { handleAuthForm } from '../shared/auth-form.js';
  
  document.addEventListener('DOMContentLoaded', function() {
    // Setup password toggle
    setupPasswordToggle('password', 'togglePassword');
    
    // Validasi form
    const form = document.getElementById('loginForm');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      // Reset errors
      hideError(emailError);
      hideError(passwordError);
      
      let isValid = true;
      
      // Validate email
      if (!validateEmail(email)) {
        showError(emailError, 'Please enter a valid email address');
        isValid = false;
      }
      
      // Validate password
      if (!validatePassword(password)) {
        showError(passwordError, 'Password must be at least 8 characters');
        isValid = false;
      }
      
      if (isValid) {
        const dataForm = {
          email: email,
          password: password
        }

        // Redirect based on role
        if (role === 'tutor') {
          handleAuthForm(dataForm, 'login', '../../dashboard/tutor/manage_course.html');
        } else {
          handleAuthForm(dataForm, 'login', '../../dashboard/learner/course.html');
        }
      }
    });
  });