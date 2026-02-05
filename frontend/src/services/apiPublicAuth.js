import { api } from "../lib/api";

export async function solicitarRedefinicaoSenha({ email }) {

  const { data } = await api.post("/public/usuario/esqueci-senha", { email });
  return data;
}
