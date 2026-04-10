import { api } from "../lib/api";

export const apiAdminDashboard = {
  async buscarAvaliacoes(params = {}) {
    const { data } = await api.get("/admin/dashboard/evaluations", { params });
    return data;
  },
};
