document.getElementById('btnLogin').addEventListener('click', async () => {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const alert = document.getElementById('loginAlert');
  alert.style.display = 'none';
  if (!username || !password) {
    alert.textContent = 'Informe usuário e senha.';
    alert.style.display = 'block';
    return;
  }

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login falhou');
    window.location.href = 'admin.html';
  } catch (err) {
    alert.textContent = err.message;
    alert.style.display = 'block';
  }
});
