import http from './http';

export async function apiLogin({ username, password }) {

  const res = await http.post('/auth/login', { username, password });
  return res.data;
}

const ROLE_MAPPING = {
  '4cca32e7-702b-4721-b902-c3780d2efa44': 'ADMIN', 
  '6097744e-f69f-450e-9f76-6aa96ec1618f': 'USER'   
};

export function saveTokensFromResponse(loginResponse) {
  const data = loginResponse?.data ?? loginResponse;
  if (!data) return;
  
  if (data.accessToken) localStorage.setItem('accessToken', data.accessToken);
  if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
  if (data.expiresIn) localStorage.setItem('tokenExpiresIn', String(data.expiresIn));

  if (data.roleId) {
    const role = ROLE_MAPPING[data.roleId] || 'USER';
    localStorage.setItem('userRole', role);
  } else if (data.role) {
    localStorage.setItem('userRole', data.role);
  } else {
    localStorage.setItem('userRole', 'USER');
  }
}

export function getUserRole() {
  return localStorage.getItem('userRole') || 'USER';
}

export function isAdmin() {
  return getUserRole() === 'ADMIN';
}

export async function apiLogout() {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const expiresIn = localStorage.getItem('tokenExpiresIn');
  
  if (!accessToken || !refreshToken) {
    throw new Error('No tokens found');
  }
  
  const res = await http.post('/auth/logout', {
    accessToken,
    refreshToken,
    expiresIn: expiresIn ? parseInt(expiresIn) : 6000
  });
  return res.data;
}

export function clearAuthTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenExpiresIn');
  localStorage.removeItem('userRole');
}

export async function apiRegister({ username, password, repeat }) {
  const res = await http.post('/users', { 
    username, 
    password, 
    repeat 
  });
  return res.data;
}


