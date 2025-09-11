// src/services/apiContatos.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001/api",
});

export const apiContatos = {
  async criar(payload){
    // payload esperado: { nome, email, telefone, mensagem, empresa? }
    // honeypot "empresa" será ignorado/rejeitado no backend se vier preenchido
    const body = { ...payload, origem: "site" };
    const { data } = await api.post("/contatos", body);
    return data;
  }
};
