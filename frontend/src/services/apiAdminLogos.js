import { api } from "../lib/api";

export const apiAdminLogos = {
  /**
   * @returns {Promise<{ok: boolean, data: string[]}>}
   */
  async listar() {
    const { data } = await api.get("/admin/logos");
    return data;
  },

  /**
   * @param {File} file 
   * @returns {Promise<{ok: boolean, filename: string, url: string, message: string}>}
   */
  async upload(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const { data } = await api.post('/admin/upload/logo', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data' 
      }
    });
    return data;
  }
};

