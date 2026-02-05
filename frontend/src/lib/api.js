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

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err?.response?.status;
    const url = (err?.config?.url || "").toLowerCase();
    const isLoginCall = url.includes("/admin/login");

    if (status === 401 && !isLoginCall) {
      try {
        localStorage.removeItem("adminToken"); 
      } catch { }

      const next = encodeURIComponent(window.location.pathname + window.location.search);
      if (window.location.pathname !== "/admin/login") {
        window.location.assign(`/admin/login?next=${next}`);
      }
    }

    return Promise.reject(err);
  }
);

export const apiAuth = axios.create({ baseURL: BASE_URL, withCredentials: true });
