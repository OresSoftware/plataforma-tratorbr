import axios from "axios";

const BASE_URL =
  (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim()) ||
  `${window.location.origin.replace(/\/$/, "")}/api`;

export const api = axios.create({ baseURL: BASE_URL, withCredentials: true });

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("adminToken");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

// Se você NÃO tiver axiosGuard central de 401/403, mantenha este bloco.
// Se JÁ tiver, pode remover para não duplicar.
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err?.response?.status;
    const url = (err?.config?.url || "").toLowerCase();
    const isLoginCall = url.includes("/admin/login");
    if ((status === 401 || status === 403) && !isLoginCall) {
      if (window.location.pathname !== "/admin/login") {
        window.location.assign("/admin/login");
      }
    }
    return Promise.reject(err);
  }
);

export const apiAuth = axios.create({ baseURL: BASE_URL, withCredentials: true });
