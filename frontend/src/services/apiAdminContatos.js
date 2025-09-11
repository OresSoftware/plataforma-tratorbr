import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001/api",
});

// Pega o token do admin
function getAdminToken() {
  return localStorage.getItem("adminToken") || "";
}

// Interceptor pra incluir Authorization
api.interceptors.request.use((cfg) => {
  const token = getAdminToken();
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Removi o interceptor de resposta para evitar conflito com axiosGuard.js
// O axiosGuard.js já cuida dos redirecionamentos

export const apiAdminContatos = {
  async listar({ status = "pendente", page = 1, pageSize = 20 } = {}) {
    const { data } = await api.get("/admin/contatos", {
      params: { status, page, pageSize },
    });
    return data;
  },
  async marcarRespondido(id) {
    const { data } = await api.patch(`/admin/contatos/${id}/respondido`);
    return data;
  },
  async excluir(id) {
    const { data } = await api.delete(`/admin/contatos/${id}`);
    return data;
  },
  async contadorPendentes() {
    const { data } = await api.get("/admin/contatos/contador");
    return data;
  },
};

