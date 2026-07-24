export function getToken() {
  return localStorage.getItem('token');
}

export function getUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

export function isAuthenticated() {
  return !!getToken();
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}