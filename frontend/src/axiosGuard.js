// Intercepta TODAS as respostas do Axios e derruba sessão no 401/IP revogado
import axios from 'axios';

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (resp) => resp,
  (error) => {
    const status = error?.response?.status;
    const code = error?.response?.data?.code;
    const url = error?.config?.url || '';

    // Não redirecionar se for erro na rota de login de admin
    if (url.includes('/api/admin/login')) {
      return Promise.reject(error);
    }

    // Não redirecionar se for erro na rota de login de usuário comum
    if (url.includes('/api/auth/login') || url.includes('/api/auth/register')) {
      return Promise.reject(error);
    }

    // Só redirecionar para admin/login se for uma rota administrativa
    if (status === 401 && (code === 'IP_REVOKED' || code === 'NO_AUTH' || code === undefined)) {
      // Verificar se é uma rota administrativa
      if (url.includes('/api/admin/')) {
        try {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminData');
        } catch (_) {}
        window.location.href = '/admin/login?reason=ip_revogado';
        return; // interrompe cadeia
      }
    }

    return Promise.reject(error);
  }
);

