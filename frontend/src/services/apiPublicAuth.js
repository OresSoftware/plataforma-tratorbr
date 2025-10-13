import axios from "axios";

/**
 * Dispara a solicitação de redefinição de senha no servidor externo.
 * Esperado: a API já envia o e-mail para o usuário e retorna expiração.
 *
 * @param {object} args
 * @param {string} args.email
 * @returns {Promise<object>} Ex.: { ok: true, name?: string, email?: string, expires_in_minutes?: number, expires_at?: string }
 */
export async function solicitarRedefinicaoSenha({ email }) {
  // Chamada direta para a rota pública informada
  // Se o servidor já tiver CORS liberado para o teu domínio, isso funciona direto.
  const url = "https://app.tratorbr.com/usuario/esqueci-senha";

  // Se a API exigir outro nome de campo (ex.: username), ajuste aqui:
  const payload = { email: String(email || "").trim() };

  const { data } = await axios.post(url, payload, {
    // Se precisar enviar cookies, mude para true e garanta SameSite/Lax no servidor:
    withCredentials: false,
    headers: {
      "Content-Type": "application/json",
      // Se a API exigir alguma chave, inclua aqui:
      // "X-API-Key": "sua-chave",
    },
  });

  return data;
}
