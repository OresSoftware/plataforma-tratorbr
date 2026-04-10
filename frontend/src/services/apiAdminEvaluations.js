import { api } from "../lib/api";

function normalizeModuleType(moduleType) {
  return String(moduleType || "").toLowerCase() === "checkbr" ? "checkbr" : "tabelabr";
}

export const apiAdminEvaluations = {
  async listar(moduleType, params = {}) {
    const normalizedModule = normalizeModuleType(moduleType);
    const { data } = await api.get(`/admin/evaluations/${normalizedModule}`, { params });
    return data;
  },

  async listarFiltros(moduleType, params = {}) {
    const normalizedModule = normalizeModuleType(moduleType);
    const { data } = await api.get(`/admin/evaluations/${normalizedModule}/filters`, { params });
    return data;
  },

  async buscarPorId(userId, avaliadorId) {
    const { data } = await api.get(`/admin/evaluations/${userId}/${avaliadorId}`);
    return data;
  },

  async baixarPdf(userId, avaliadorId) {
    const response = await api.get(`/admin/evaluations/${userId}/${avaliadorId}/pdf`, {
      responseType: "blob",
    });

    const contentDisposition = response.headers?.["content-disposition"] || "";
    const match =
      contentDisposition.match(/filename\*=UTF-8''([^;]+)/i) ||
      contentDisposition.match(/filename=\"?([^"]+)\"?/i);
    const fileName = match?.[1]
      ? decodeURIComponent(match[1].replace(/"/g, ""))
      : `avaliacao-${userId}.${avaliadorId}.pdf`;

    return {
      blob: response.data,
      fileName,
    };
  },
};
