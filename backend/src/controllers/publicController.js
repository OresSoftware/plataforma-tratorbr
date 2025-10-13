const axios = require("axios");

async function proxyEsqueciSenha(req, res) {
  try {
    const email = String(req.body?.email || "").trim();
    if (!email) {
      return res.status(400).json({ ok: false, error: "Email é obrigatório" });
    }

    // >>> ajuste aqui se a rota externa mudar
    const url = "https://app.tratorbr.com/usuario/esqueci-senha";

    const { data } = await axios.post(
      url,
      { email },
      { headers: { "Content-Type": "application/json" }, timeout: 15000 }
    );

    // devolve exatamente o JSON que o serviço externo retornar
    return res.status(200).json(data);
  } catch (e) {
    const status = e?.response?.status || 500;
    const payload =
      e?.response?.data || { ok: false, error: "Falha ao contatar serviço externo." };
    return res.status(status).json(payload);
  }
}

module.exports = { proxyEsqueciSenha };
