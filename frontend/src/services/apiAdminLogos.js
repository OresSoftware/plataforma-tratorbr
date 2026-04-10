import { api } from "../lib/api";

export const apiAdminLogos = {
  /**
   * Lista todos os arquivos de logo disponíveis na pasta /images/manufacturer
   * @returns {Promise<{ok: boolean, data: string[]}>}
   */
  async listar() {
    const { data } = await api.get("/admin/logos");
    return data;
  },

  /**
   * Faz upload de uma nova logo
   * O arquivo será salvo com o nome original (sanitizado)
   * @param {File} file - Arquivo de imagem
   * @returns {Promise<{ok: boolean, filename: string, url: string, message: string}>}
   */
  async upload(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const { data } = await api.post('/admin/upload/logo', formData);
    return data;
  }
};
