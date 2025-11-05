// frontend/src/services/apiRelatorios.js
import { api } from "../lib/api";

export const apiRelatorios = {
  /**
   * Gera um novo relatório
   * @param {string} tipo - 'anual', 'mensal' ou 'semanal'
   * @returns {Promise}
   */
  async gerar(tipo) {
    const { data } = await api.post("/admin/relatorios/gerar", { tipo });
    return data;
  },

  /**
   * Lista o histórico de relatórios gerados
   * @returns {Promise}
   */
  async listarHistorico() {
    const { data } = await api.get("/admin/relatorios/historico");
    return data;
  },

  /**
   * Baixa um relatório específico
   * @param {number} id - ID do relatório
   * @returns {Promise}
   */
  async baixar(id) {
    const response = await api.get(`/admin/relatorios/${id}/download`, {
      responseType: 'blob', // Importante para download de arquivo
    });
    return response;
  },

  /**
   * Exclui um relatório
   * @param {number} id - ID do relatório
   * @returns {Promise}
   */
  async excluir(id) {
    const { data } = await api.delete(`/admin/relatorios/${id}`);
    return data;
  },
};
