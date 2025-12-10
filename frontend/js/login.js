// frontend/js/login.js (Versão atualizada para JWT)

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const messageElement = document.getElementById('message');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault(); 

      messageElement.textContent = ''; 
      messageElement.classList.remove('error-message', 'success-message');

      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      const loginData = { username, password };

      try {
        const response = await fetch('http://localhost:3000/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData)
        });

        const result = await response.json();

        if (response.ok) { 
          // 🚨 NOVIDADE: Armazena o token JWT
          localStorage.setItem('jwtToken', result.token); 
          localStorage.setItem('currentUser', result.user); // Mantém o nome do usuário

          messageElement.textContent = `Login bem-sucedido! Redirecionando...`;
          messageElement.classList.add('success-message');
                    
          window.location.href = 'dashboard.html'; 
        } else {
          messageElement.textContent = result.message || 'Erro de login. Credenciais inválidas.';
          messageElement.classList.add('error-message');
        }
      } catch (error) {
          console.error('Erro de rede:', error);
          messageElement.textContent = 'Não foi possível conectar ao servidor.';
          messageElement.classList.add('error-message');
        }
    });
  }
});