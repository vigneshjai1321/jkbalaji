const login = await fetch('http://127.0.0.1:4000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@jkbalaji.in', password: 'ChangeMe@JK2026!' }),
});
const body = await login.json();
console.log('login_status', login.status);
console.log('has_token', Boolean(body.accessToken));
const token = body.accessToken;
const dash = await fetch('http://127.0.0.1:4000/api/v1/admin/dashboard', {
  headers: { Authorization: `Bearer ${token}` },
});
console.log('dashboard_status', dash.status);
const me = await fetch('http://127.0.0.1:4000/api/v1/auth/me', {
  headers: { Authorization: `Bearer ${token}` },
});
console.log('me_status', me.status);
