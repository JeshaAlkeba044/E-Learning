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

  if (localStorage.getItem('token') && localStorage.getItem('user')) {
    // User is already logged in, redirect to appropriate dashboard
    const user = JSON.parse(localStorage.getItem('user'));
    let redirectUrl;
    
    switch(user.role) {
      case 'tutor':
        redirectUrl = '../../dashboard/tutor/dashboard_tutor.html';
        break;
      case 'learner':
        redirectUrl = '../../dashboard/learner/LearnerDashboard.html';
        break;
      default:
        redirectUrl = '../../index.html';
    }
    
    window.location.href = redirectUrl;
    
  }
  
  
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