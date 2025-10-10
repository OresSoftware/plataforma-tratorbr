// frontend/src/services/apiAdminUsers.js
import { api } from "../lib/api";

export const apiAdminUsers = {
  async listar({ status = "todos", page = 1, pageSize = 20, busca = '' } = {}) {
    const { data } = await api.get("/admin/users", {
      params: { status, page, pageSize, busca },
    });
    return data;
  },

  async buscarPorId(id) {
    const { data } = await api.get(`/admin/users/${id}`);
    return data;
  },

  async atualizar(id, payload) {
    const { data } = await api.put(`/admin/users/${id}`, payload);
    return data;
  },

  async ativarDesativar(id, status) {
    const { data } = await api.patch(`/admin/users/${id}/status`, { status });
    return data;
  },

  async resetarSenha(id) {
    const { data } = await api.post(`/admin/users/${id}/reset-password`);
    return data;
  },

  async contadorAtivos() {
    const { data } = await api.get('/admin/users/contador/ativos');
    return data;
  },
};