import { 
  validatePassword, 
  showError, 
  hideError 
} from '../shared/auth-validation.js';

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('resetPasswordForm');
  const newPasswordError = document.getElementById('newPasswordError');
  const confirmPasswordError = document.getElementById('confirmPasswordError');
  
  // Ambil email dari localStorage
  const email = localStorage.getItem('resetEmail');
  
  if (!email) {
    window.location.href = 'indexForgotPass.html';
    return;
  }

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Reset errors
    hideError(newPasswordError);
    hideError(confirmPasswordError);
    
    let isValid = true;
    
    // Validate new password
    if (!validatePassword(newPassword)) {
      showError(newPasswordError, 'Password must be at least 8 characters');
      isValid = false;
    }
    
    // Validate password match
    if (newPassword !== confirmPassword) {
      showError(confirmPasswordError, 'Passwords do not match');
      isValid = false;
    }
    
    if (isValid) {
      try {
        const response = await fetch('http://localhost:3000/api/auth/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email,
            newPassword: newPassword
          })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Password reset failed');
        }

        // Hapus email dari localStorage setelah reset berhasil
        localStorage.removeItem('resetEmail');
        
        alert('Password has been reset successfully!');
        window.location.href = '../login/indexLogin.html';
      } catch (error) {
        showError(newPasswordError, error.message);
      }
    }
  });
});