import { api } from "../lib/api";

export const apiAvaliacoes = {

  async criar(payload) {
    const { data } = await api.post("/avaliacoes", payload);
    return data;
  },

  async listar({ page = 1, pageSize = 10 } = {}) {
    const { data } = await api.get("/avaliacoes", {
      params: { page, pageSize },
    });
    return data;
  },

  async obterEstatisticas() {
    const { data } = await api.get("/avaliacoes/stats");
    return data;
  },
};

export const apiAvaliacoesAdmin = {

  async listar({ status = "todos", page = 1, pageSize = 20 } = {}) {
    const { data } = await api.get("/admin/avaliacoes", {
      params: { status, page, pageSize },
    });
    return data;
  },

  async atualizarStatus(id, ativo) {
    const { data } = await api.patch(`/admin/avaliacoes/${id}/status`, {
      ativo,
    });
    return data;
  },

  async deletar(id) {
    const { data } = await api.delete(`/admin/avaliacoes/${id}`);
    return data;
  },

  async contadorAtivas() {
    const { data } = await api.get("/admin/avaliacoes/contador/ativas");
    return data;
  },
};
