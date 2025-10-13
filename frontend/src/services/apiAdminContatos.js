// frontend/src/services/apiAdminContatos.js
import { api } from "../lib/api";

export const apiAdminContatos = {
  async listar({ status = "pendente", page = 1, pageSize = 20 } = {}) {
    const { data } = await api.get("/admin/contatos", {
      params: { status, page, pageSize },
    });
    return data;
  },

  async marcarRespondido(id, canal) {
    // canal: 'email' | 'whatsapp'
    const { data } = await api.patch(`/admin/contatos/${id}/respondido`, { canal });
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
