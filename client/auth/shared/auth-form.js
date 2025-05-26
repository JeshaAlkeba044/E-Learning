export async function handleAuthForm(data, idForm, endpoint, redirectUrls) {
  const form = document.getElementById(idForm);
  if (!form) return;

  try {
    const response = await fetch(`http://localhost:3000/api/auth/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Something went wrong');
    }

    if (endpoint === 'login') {
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));

      console.log("result:", result )

      // Determine redirect URL based on role
      let redirectUrl;
      switch(result.user.role) {
        case 'tutor':
          redirectUrl = redirectUrls.tutor || '/dashboard/tutor/manage_course.html';
          break;
        case 'learner':
          redirectUrl = redirectUrls.learner || '/dashboard/learner/LearnerDashboard.html';
          break;
        default:
          redirectUrl = redirectUrls.default || '/';
      }

      window.location.href = redirectUrl;
    } else if (endpoint === 'register') {
      // For registration, show success message before redirect
      alert('Registration successful! Please check your email for verification.');
      window.location.href = result.user.role === 'tutor' 
        ? redirectUrls.tutor 
        : redirectUrls.learner;
    }
  } catch (error) {
    console.error(`${endpoint} error:`, error.message);
    alert(error.message);
  }
}

export function setupFormSubmit(formId, endpoint, redirectUrls, dataMapper) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData(form);
      const data = dataMapper ? dataMapper(formData) : Object.fromEntries(formData.entries());
      
      await handleAuthForm(data, formId, endpoint, redirectUrls);
    } catch (error) {
      console.error('Form submission error:', error);
      alert('An error occurred while processing your request');
    }
  });
}