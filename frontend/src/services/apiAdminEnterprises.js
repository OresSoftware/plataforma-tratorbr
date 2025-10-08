// frontend/src/services/apiAdminEnterprises.js
import { api } from "../lib/api";

export const apiAdminEnterprises = {
  async listar({ status = "todos", page = 1, pageSize = 20, busca = '' } = {}) {
    const { data } = await api.get("/admin/enterprises", {
      params: { status, page, pageSize, busca },
    });
    return data;
  },

  async buscarPorId(id) {
    const { data } = await api.get(`/admin/enterprises/${id}`);
    return data;
  },

  async criar(payload) {
    const { data } = await api.post('/admin/enterprises', payload);
    return data;
  },

  async atualizar(id, payload) {
    const { data } = await api.put(`/admin/enterprises/${id}`, payload);
    return data;
  },

  async ativarDesativar(id, ativo) {
    const { data } = await api.patch(`/admin/enterprises/${id}/status`, { ativo });
    return data;
  },

  async contadorAtivos() {
    const { data } = await api.get('/admin/enterprises/contador/ativos');
    return data;
  },
};
