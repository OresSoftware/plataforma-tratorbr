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

// Se você NÃO tiver um axiosGuard global, mantenha este bloco.
// Caso já tenha um guard central, remova este para não duplicar.
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err?.response?.status;
    const url = (err?.config?.url || "").toLowerCase();
    const isLoginCall = url.includes("/admin/login");

    if (status === 401 && !isLoginCall) {
      try {
        localStorage.removeItem("adminToken"); // limpa token
      } catch { }

      const next = encodeURIComponent(window.location.pathname + window.location.search);
      if (window.location.pathname !== "/admin/login") {
        window.location.assign(`/admin/login?next=${next}`);
      }
    }

    // 403 "sem permissão" — não redireciona para login aqui.
    return Promise.reject(err);
  }
);

export const apiAuth = axios.create({ baseURL: BASE_URL, withCredentials: true });
