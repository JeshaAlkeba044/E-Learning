export async function handleAuthForm(data, endpoint, redirectUrl) {
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
  
      console.log('Data to send:', data); // Debugging
      
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

        }
        
        console.log(`${endpoint} success:`, result); //debug

        window.location.href = redirectUrl;
        
      } catch (error) {
        console.error(`${endpoint} error:`, error.message);
        alert(error.message);
      }
    });
  }