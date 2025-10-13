// frontend/src/services/apiPublicAuth.js
import { api } from "../lib/api"; 
// use o mesmo axios do projeto (que aponta pro seu backend)

export async function solicitarRedefinicaoSenha({ email }) {
  // chama o proxy no SEU backend
  const { data } = await api.post("/public/usuario/esqueci-senha", { email });
  return data; // ex.: { ok: true, name?, email?, expires_in_minutes?, expires_at? }
}
