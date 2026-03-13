import axios from 'axios';
import { getAppUserToken, logoutUsuario } from './services/apiUserAuth';

axios.interceptors.request.use((config) => {
  const token = getAppUserToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (resp) => resp,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || '';

    if (status === 401) {
      if (!url.includes('/entrar') && !url.includes('/cadastrar')) {
        try {
          logoutUsuario();
        } catch (_) {}
        window.location.href = '/entrar?reason=session_expired';
      }
    }

    return Promise.reject(error);
  }
);