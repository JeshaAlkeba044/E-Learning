  import { 
    validateEmail, 
    validatePassword, 
    showError, 
    hideError,
    setupPasswordToggle
  } from '../shared/auth-validation.js';

  document.addEventListener('DOMContentLoaded', function() {
    // Role selection
    const learnerOption = document.getElementById('learnerOption');
    const tutorOption = document.getElementById('tutorOption');
    const tutorFields = document.getElementById('tutorFields');
    
    // Setup password toggle
    setupPasswordToggle('password', 'togglePassword');
    setupPasswordToggle('confirmPassword', 'toggleConfirmPassword');
    
    // Role selection handler
    function handleRoleSelection() {
      if (document.querySelector('input[name="role"]:checked').value === 'tutor') {
        tutorOption.classList.add('selected');
        learnerOption.classList.remove('selected');
        tutorFields.style.display = 'block';
      } else {
        learnerOption.classList.add('selected');
        tutorOption.classList.remove('selected');
        tutorFields.style.display = 'none';
      }
    }
    
    learnerOption.addEventListener('click', handleRoleSelection);
    tutorOption.addEventListener('click', handleRoleSelection);


    const form = document.getElementById('registerForm');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    
    // Setup password toggle
    setupPasswordToggle('password', 'togglePassword');
    setupPasswordToggle('confirmPassword', 'toggleConfirmPassword');
    
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const role = document.querySelector('input[name="role"]:checked').value;
      
      // Reset errors
      hideError(emailError);
      hideError(passwordError);
      hideError(confirmPasswordError);
      
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
      
      // Validate password match
      if (password !== confirmPassword) {
        showError(confirmPasswordError, 'Passwords do not match');
        isValid = false;
      }

      // Additional validation for tutor
      if (role === 'tutor') {
        const specialization = document.getElementById('specialization').value;
        const experience = document.getElementById('experience').value;
        
        if (!specialization) {
          alert('Please enter your specialization');
          isValid = false;
        }
        
        if (!experience) {
          alert('Please select your experience level');
          isValid = false;
        }
      }

      if (!isValid) return;

      try {
        const formData = {
          firstName: document.getElementById('firstName').value,
          lastName: document.getElementById('lastName').value,
          email: email,
          password: password,
          role: role
        };

        // Tambahkan field khusus tutor
        if (role === 'tutor') {
          formData.specialization = document.getElementById('specialization').value;
          formData.experience = document.getElementById('experience').value;
          formData.bio = document.getElementById('bio').value;
          formData.portofolio = document.getElementById('portfolio').value;
        }

        const response = await fetch('http://localhost:3000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Registration failed');
        }

        // Simpan email untuk verifikasi OTP
        localStorage.setItem('resetEmail', email);
        localStorage.setItem('otpSource', 'register');
        
        // Redirect ke halaman OTP
        window.location.href = '../forgot-password/indexOTP.html';
      } catch (error) {
        showError(emailError, error.message);
      }
    });
  });