export async function handleAuthForm(data, idForm, endpoint, redirectUrl_1, redirectUrl_2, redirectUrl_3) {
    
    const form = document.getElementById(idForm);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
            
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

          const userData = JSON.stringify(result.user);

          if(result.user.role === 'tutor'){
            window.location.href = redirectUrl_1;
            return
          }else if(result.user.role === 'learner'){
            window.location.href = redirectUrl_2;
            return
          }else{
            window.location.href = redirectUrl_3;
            return
          }
        }

        window.location.href = redirectUrl_1;
        
      } catch (error) {
        console.error(`${endpoint} error:`, error.message);
        alert(error.message);
      }
    });
  }