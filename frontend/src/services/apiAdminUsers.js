import { api } from "../lib/api";

export const apiAdminUsers = {
  async listar({
    status = "todos",
    page = 1,
    pageSize = 20,
    busca = "",
    date_from,
    date_to,
    enterprise_id,
    cargo_id,
    city_id,
    sort = "name_asc",
  } = {}) {
    const params = { status, page, pageSize };
    if (busca) params.busca = busca;
    if (date_from) params.date_from = date_from;
    if (date_to) params.date_to = date_to;
    if (enterprise_id) params.enterprise_id = enterprise_id;
    if (cargo_id) params.cargo_id = cargo_id;
    if (city_id) params.city_id = city_id;
    if (sort) params.sort = sort;

    const { data } = await api.get("/admin/users", { params });
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
    const { data } = await api.get("/admin/users/contador/ativos");
    return data;
  },
};
