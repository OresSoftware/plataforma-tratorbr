import axios from 'axios';

const apiApp = axios.create({
  baseURL: import.meta.env.VITE_API_URL_LOGIN || 'http://localhost:3001',
  withCredentials: true
} );

export async function loginUsuario({ email, senha }) {
  try {
    const { data } = await apiApp.post('/api/public/usuario/login', {
      email,
      senha
    });
    
    if (data && data.token) {
      localStorage.setItem('appUserToken', data.token);
      
      if (data) {
        localStorage.setItem('appUserData', JSON.stringify(data));
      }
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
}

export function logoutUsuario() {
  localStorage.removeItem('appUserToken');
  localStorage.removeItem('appUserData');
}

export function isUsuarioLogado() {
  return !!localStorage.getItem('appUserToken');
}

export function getAppUserToken() {
  return localStorage.getItem('appUserToken');
}

export function getAppUserData() {
  const data = localStorage.getItem('appUserData');
  return data ? JSON.parse(data) : null;
}
