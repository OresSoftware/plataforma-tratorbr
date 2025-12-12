import { api } from "../lib/api";

export const apiContatos = {
  async criar(payload) {
    const body = { ...payload, origem: "site" };
    const { data } = await api.post("/contatos", body);
    return data;
  },
};
