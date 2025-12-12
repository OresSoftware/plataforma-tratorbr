import { api } from "../lib/api";
// mesmo axios do projeto (que aponta pro seu backend)

export async function solicitarRedefinicaoSenha({ email }) {

  const { data } = await api.post("/public/usuario/esqueci-senha", { email });
  return data;
}
