import { 
  showError, 
  hideError 
} from '../shared/auth-validation.js';

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('otpForm');
  const otpError = document.getElementById('otpError');
  const resendLink = document.getElementById('resendOtp');
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const otp = document.getElementById('otp').value;
    
    // Reset error
    hideError(otpError);
    
    // Validate OTP
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      showError(otpError, 'Please enter a valid 6-digit code');
      return;
    }
    
    // In a real app, you would verify the OTP with your backend
    // For demo, we'll just redirect to reset password page
    window.location.href = 'indexResetPass.html';
  });
  
  // Resend OTP functionality
  resendLink.addEventListener('click', function(e) {
    e.preventDefault();
    alert('A new OTP code has been sent to your email.');
  });
});