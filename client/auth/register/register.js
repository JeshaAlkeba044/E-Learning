import { 
    validateEmail, 
    validatePassword, 
    showError, 
    hideError,
    setupPasswordToggle
  } from '../shared/auth-validation.js';
  import { handleAuthForm } from '../shared/auth-form.js';
  
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
    
    form.addEventListener('submit', function(e) {
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

      if (isValid) {
        const formData = {
          firstName: document.getElementById('firstName').value,
          lastName: document.getElementById('lastName').value,
          email: email,
          password: password,
          role: role,
          ...(role === 'tutor' && {
            specialization: document.getElementById('specialization').value,
            experience: document.getElementById('experience').value,
            bio: document.getElementById('bio').value,
            portfolio: document.getElementById('portfolio').value
          })
        };

        console.log('Registration data:', formData);


        // Redirect based on role
        if (role === 'tutor') {
          handleAuthForm(formData, 'registerForm', 'register', '../../dashboard/tutor/manage_course.html');
        } else {
          handleAuthForm(formData, 'registerForm', 'register', '../../dashboard/learner/LearnerDashboard.html');
        }
      }
    });
  });