import { api } from "../lib/api";

export const apiAdminEnterprises = {
  async listar({
    status = "todos",
    page = 1,
    pageSize = 20,
    busca = '',
    order = '',
    tipo = '',
    city_id = 0
  } = {}) {
    const { data } = await api.get("/admin/enterprises", {
      params: { status, page, pageSize, busca, order, tipo, city_id },
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

  async listarUsuariosDaEmpresa(id) {
    const { data } = await api.get(`/admin/enterprises/${id}/users`);
    return data;
  },

  async getCobranca(enterpriseId) {
    const { data } = await api.get(`/admin/enterprises/${enterpriseId}/cobranca`);
    return data;
  },

  async upsertCobranca(enterpriseId, payload) {
    const { data } = await api.put(`/admin/enterprises/${enterpriseId}/cobranca`, payload);
    return data;
  },

  async deleteCobranca(enterpriseId) {
    const { data } = await api.delete(`/admin/enterprises/${enterpriseId}/cobranca`);
    return data;
  },

};
