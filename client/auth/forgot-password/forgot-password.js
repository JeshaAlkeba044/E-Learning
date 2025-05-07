// import { 
//     validateEmail, 
//     showError, 
//     hideError 
//   } from '../shared/auth-validation.js';
//   import { handleAuthForm } from '../shared/auth-form.js';
  
//   document.addEventListener('DOMContentLoaded', function() {
//     const form = document.getElementById('forgotPasswordForm');
//     const emailError = document.getElementById('emailError');
    
//     form.addEventListener('submit', function(e) {
//       e.preventDefault();
//       const email = document.getElementById('email').value;
      
//       // Reset error
//       hideError(emailError);
      
//       // Validate email
//       if (!validateEmail(email)) {
//         showError(emailError, 'Please enter a valid email address');
//         return;
//       }
      
//       handleAuthForm('forgotPasswordForm', 'forgot-password', '/auth/login');
//     });
//   });




import { 
  validateEmail, 
  showError, 
  hideError 
} from '../shared/auth-validation.js';

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('forgotPasswordForm');
  const emailError = document.getElementById('emailError');
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    
    // Reset error
    hideError(emailError);
    
    // Validate email
    if (!validateEmail(email)) {
      showError(emailError, 'Please enter a valid email address');
      return;
    }
    
    // In a real app, you would send the email to your backend
    // For demo, we'll just redirect to OTP page
    window.location.href = 'indexOTP.html';
  });
});