const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const username = loginForm.username.value;
  const password = loginForm.password.value;

  // TODO: Replace this with actual authentication code
  if (username === 'admin' && password === '111') {
    window.location.href = '/jobUpdate';
  } else {
    alert('Invalid username or password');
  }
});
