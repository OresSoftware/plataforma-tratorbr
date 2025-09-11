// Cliente padrão (páginas protegidas)
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3001/api",
});

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("adminToken");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

// Redireciona somente FORA do login
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

// Cliente “limpo” para a página de login (sem interceptors)
export const apiAuth = axios.create({
  baseURL: "http://localhost:3001/api",
});
