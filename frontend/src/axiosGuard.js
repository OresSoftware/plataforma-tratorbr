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

    if (url.includes('/api/admin/login')) {
      return Promise.reject(error);
    }

    if (url.includes('/api/auth/login') || url.includes('/api/auth/register')) {
      return Promise.reject(error);
    }

    if (status === 401 && (code === 'IP_REVOKED' || code === 'NO_AUTH' || code === undefined)) {
      if (url.includes('/api/admin/')) {
        try {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminData');
        } catch (_) {}
        window.location.href = '/admin/login?reason=ip_revogado';
        return; 
      }
    }

    return Promise.reject(error);
  }
);

