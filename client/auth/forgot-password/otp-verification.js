import { 
  showError, 
  hideError 
} from '../shared/auth-validation.js';

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('otpForm');
  const otpError = document.getElementById('otpError');
  const resendLink = document.getElementById('resendOtp');
  
  // Ambil email dari localStorage atau URL
  const email = localStorage.getItem('resetEmail') || new URLSearchParams(window.location.search).get('email');
  
  if (!email) {
    window.location.href = '../forgot-password/indexForgotPass.html';
    return;
  }

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const otp = document.getElementById('otp').value;

    console.log('email:', email); //debugging
    
    // Reset error
    hideError(otpError);
    
    // Validate OTP
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      showError(otpError, 'Please enter a valid 6-digit code');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          otp: otp
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'OTP verification failed');
      }

      // Jika dari forgot password, redirect ke reset password
      const source = localStorage.getItem('otpSource');

      if (source === 'forgot-password') {
        window.location.href = 'indexResetPass.html';
      } else {
        alert('Email verified successfully! You can now login.');

        // Clear localStorage
        localStorage.removeItem('otpSource');
        localStorage.removeItem('resetEmail');

        window.location.href = '../login/indexLogin.html';
      }

    } catch (error) {
      showError(otpError, error.message);
    }
  });
  
  // Resend OTP functionality
  resendLink.addEventListener('click', async function(e) {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email })
      });

      if (!response.ok) {
        throw new Error('Failed to resend OTP');
      }

      alert('A new OTP code has been sent to your email.');
    } catch (error) {
      alert(error.message);
    }
  });
});