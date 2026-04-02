const axios = require("axios");
const jwt = require('jsonwebtoken');

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

async function proxyLoginUsuario(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        ok: false,
        error: 'Email e senha são obrigatórios'
      });
    }

    const url = `${process.env.APP_API_URL}/usuario/login`;

    const { data } = await axios.post(
      url,
      { email, senha },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      }
    );

    if (!data || !data.user_id) {
      return res.status(401).json({
        ok: false,
        error: 'Resposta de login inválida da API externa.'
      });
    }

    if (!data.enterprise_id) {
      return res.status(403).json({
        ok: false,
        error: 'Usuário autenticado sem empresa vinculada.'
      });
    }

    const localTokenPayload = {
      user_id: data.user_id,
      email: data.email,
      firstname: data.firstname,
      lastname: data.lastname,
      enterprise_id: data.enterprise_id,
      enterprise_fantasia: data.enterprise_fantasia,
      enterprise_razao: data.enterprise_razao,
      cargo_id: data.cargo_id,
      cargo_name: data.cargo_name,
      ocupacao_id: data.ocupacao_id,
      ocupacao_name: data.ocupacao_name,
      status: data.status
    };

    const localToken = jwt.sign(
      localTokenPayload,
      process.env.APP_USER_JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      ...data,
      token: localToken
    });
  } catch (e) {
    const status = e?.response?.status || 500;
    const payload =
      e?.response?.data || { ok: false, error: 'Falha ao contatar serviço externo.' };

    return res.status(status).json(payload);
  }
}


async function proxyRegistroUsuario(req, res) {
  try {
    const { firstname, lastname, ocupacao_id, fone, email, senha } = req.body;

    // Validação básica
    if (!firstname || !lastname || !email || !senha || !ocupacao_id || !fone) {
      return res.status(400).json({
        ok: false,
        error: "Todos os campos são obrigatórios"
      });
    }

    // URL da API externa (usando variável de ambiente)
    const url = `${process.env.APP_API_URL}/usuario/cadastro`;

    // Fazer requisição para a API externa
    const { data } = await axios.post(
      url,
      { firstname, lastname, ocupacao_id, fone, email, senha },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 15000
      }
    );

    // Retornar exatamente o que a API externa retornar
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
