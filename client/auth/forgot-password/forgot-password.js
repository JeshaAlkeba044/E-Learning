import { 
  validateEmail, 
  showError, 
  hideError 
} from '../shared/auth-validation.js';

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('forgotPasswordForm');
  const emailError = document.getElementById('emailError');
  
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    
    // Reset error
    hideError(emailError);
    
    // Validate email
    if (!validateEmail(email)) {
      showError(emailError, 'Please enter a valid email address');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send OTP');
      }

      // Simpan email di localStorage untuk digunakan di halaman OTP
      localStorage.setItem('resetEmail', email);
      localStorage.setItem('otpSource', 'forgot-password');
      
      // Redirect ke halaman OTP
      window.location.href = 'indexOTP.html';
    } catch (error) {
      showError(emailError, error.message);
    }
  });
});