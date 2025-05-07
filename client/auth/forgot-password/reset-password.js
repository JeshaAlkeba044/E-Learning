import { 
  validatePassword, 
  showError, 
  hideError 
} from '../shared/auth-validation.js';

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('resetPasswordForm');
  const newPasswordError = document.getElementById('newPasswordError');
  const confirmPasswordError = document.getElementById('confirmPasswordError');
  
  form.addEventListener('submit', function(e) {
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
      // In a real app, you would send the new password to your backend
      // For demo, we'll show a success message and redirect to login
      alert('Password has been reset successfully!');
      window.location.href = '/auth/login';
    }
  });
});