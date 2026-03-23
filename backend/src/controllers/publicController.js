const axios = require("axios");

async function proxyEsqueciSenha(req, res) {
  try {
    const email = String(req.body?.email || "").trim();
    if (!email) {
      return res.status(400).json({ ok: false, error: "Email é obrigatório" });
    }

    const url = "https://app.tratorbr.com/usuario/esqueci-senha";

    const { data } = await axios.post(
      url,
      { email },
      { headers: { "Content-Type": "application/json" }, timeout: 15000 }
    );

    return res.status(200).json(data);
  } catch (e) {
    const status = e?.response?.status || 500;
    const payload =
      e?.response?.data || { ok: false, error: "Falha ao contatar serviço externo." };
    return res.status(status).json(payload);
  }
}

async function proxyLoginUsuario(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        ok: false,
        error: "Email e senha são obrigatórios"
      });
    }

    const url = `${process.env.APP_API_URL}/usuario/login`;

    const { data } = await axios.post(
      url,
      { email, senha },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 15000
      }
    );

    return res.status(200).json(data);
  } catch (e) {
    const status = e?.response?.status || 500;
    const payload =
      e?.response?.data || { ok: false, error: "Falha ao contatar serviço externo." };
    return res.status(status).json(payload);
  }
}

async function proxyRegistroUsuario(req, res) {
  try {
    const { firstname, lastname, ocupacao_id, fone, email, senha } = req.body;

    if (!firstname || !lastname || !email || !senha || !ocupacao_id || !fone) {
      return res.status(400).json({
        ok: false,
        error: "Todos os campos são obrigatórios"
      });
    }

    const url = `${process.env.APP_API_URL}/usuario/cadastro`;

    const { data } = await axios.post(
      url,
      { firstname, lastname, ocupacao_id, fone, email, senha },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 15000
      }
    );

    return res.status(200).json(data);
  } catch (e) {
    const status = e?.response?.status || 500;
    const payload =
      e?.response?.data || { ok: false, error: "Falha ao contatar serviço externo." };
    return res.status(status).json(payload);
  }
}

async function getOcupacoes(req, res) {
  try {
    const sql = `
      SELECT ocupacao_id, name 
      FROM ocbr_ocupacao 
      WHERE status = 1 
      ORDER BY sequencial ASC
    `;

    const [rows] = await require('../config/db').query(sql);

    return res.status(200).json(rows);
  } catch (e) {
    console.error('Erro ao buscar ocupações:', e);
    return res.status(500).json({
      ok: false,
      error: "Falha ao buscar ocupações."
    });
  }
}


module.exports = { proxyEsqueciSenha, proxyLoginUsuario, proxyRegistroUsuario, getOcupacoes };
