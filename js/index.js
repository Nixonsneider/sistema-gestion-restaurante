window.addEventListener('DOMContentLoaded', function(){
   let btn = document.getElementById('enter')
   let emailInput = document.getElementById('email')
   let passwordInput = document.getElementById('password')
   
   btn.addEventListener('click', async function(){
      await login();
   })
   
   passwordInput.addEventListener('keypress', async function(event){
      if (event.key === 'Enter') {
         await login();
      }
   })
   
   emailInput.addEventListener('keypress', async function(event){
      if (event.key === 'Enter') {
         await login();
      }
   })
})

async function login() {
   const emailInput = document.getElementById('email');
   const passwordInput = document.getElementById('password');
   const roleSelect = document.getElementById('role');
   
   const email = emailInput.value.trim();
   const password = passwordInput.value.trim();
   const selectedRole = roleSelect.value;
   
   if (!email || !password) {
      showToast('Por favor ingrese email y contraseña', 'warning');
      return;
   }
   
   if (!selectedRole) {
      showToast('Por favor seleccione un rol', 'warning');
      return;
   }
   
   try {
      const response = await fetch('http://localhost:3000/login', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            email: email,
            contrasena: password
         })
      });
      
      const data = await response.json();
      
      if (response.ok) {
         if (data.usuario.rol !== selectedRole) {
            showToast('El rol seleccionado no coincide con tu cuenta', 'warning');
            return;
         }
         
         console.log('Login exitoso:', data);
         showToast('¡Bienvenido ' + data.usuario.nombre + '!', 'success');
         
         localStorage.setItem('usuario', JSON.stringify(data.usuario));
         
         setTimeout(() => {
            if (data.usuario.rol === 'administrativo') {
               window.location.href = "html/admin.html";
            } else if (data.usuario.rol === 'mesero') {
               window.location.href = "html/waiter.html";
            }
         }, 500);
      } else {
         console.error('Login fallido:', data);
         showToast(data.error || 'Credenciales incorrectas', 'error');
      }
      
   } catch (error) {
      console.error('Error al conectar con el servidor:', error);
      showToast('Error al conectar con el servidor. Asegúrese de que el backend esté ejecutándose.', 'error');
   }
}