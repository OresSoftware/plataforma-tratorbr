import axios from 'axios';

const apiApp = axios.create({
  baseURL: import.meta.env.VITE_API_URL_LOGIN || 'http://localhost:3001',
  withCredentials: true
});

export async function loginUsuario({ email, senha }) {
  try {
    const { data } = await apiApp.post('/api/public/usuario/login', {
      email,
      senha
    });

    if (data && data.token) {
      localStorage.setItem('appUserToken', data.token);

      const expiresAt = new Date().getTime() + (24 * 60 * 60 * 1000);
      localStorage.setItem('appUserTokenExpires', expiresAt);

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
  localStorage.removeItem('appUserTokenExpires');
}

export function isUsuarioLogado() {
  const token = localStorage.getItem('appUserToken');
  const expiresAt = localStorage.getItem('appUserTokenExpires');

  if (!token || !expiresAt) {
    return false;
  }

  const now = new Date().getTime();
  if (now > parseInt(expiresAt)) {
    logoutUsuario();
    return false;
  }

  return true;
}

export function getAppUserToken() {
  return localStorage.getItem('appUserToken');
}

export function getAppUserData() {
  const data = localStorage.getItem('appUserData');
  return data ? JSON.parse(data) : null;
}

export async function listarUsuariosGestao() {
  try {
    const token = getAppUserToken();

    if (!token) {
      throw new Error('Token do usuário não encontrado.');
    }

    const { data } = await apiApp.get('/api/gestao/usuarios', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return data;
  } catch (error) {
    console.error('Erro ao listar usuários da gestão:', error);
    throw error;
  }
}
