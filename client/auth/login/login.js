import { 
  validateEmail, 
  validatePassword, 
  showError, 
  hideError,
  setupPasswordToggle 
} from '../shared/auth-validation.js';
import { setupFormSubmit } from '../shared/auth-form.js';

document.addEventListener('DOMContentLoaded', function() {
  // Setup password toggle
  setupPasswordToggle('password', 'togglePassword');
  
  // Form validation and submission
  setupFormSubmit('loginForm', 'login', {
    tutor: '../../dashboard/tutor/dashboard_tutor.html',
    learner: '../../dashboard/learner/LearnerDashboard.html',
    default: '../../index.html'
  });
  
  // Additional client-side validation
  const form = document.getElementById('loginForm');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  
  form.addEventListener('submit', function(e) {
    const email = form.email.value;
    const password = form.password.value;
    
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
    
    if (!isValid) {
      e.preventDefault();
    }
  });
});