const pool = require("../config/db");

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || "");
}
function onlyDigits(v) {
  return String(v || "").replace(/\D/g, "");
}

async function criarContato(req, res) {
  try {
    const { nome, email, telefone, mensagem, empresa, origem = "site" } = req.body || {};

    if (empresa && String(empresa).trim() !== "") {
      return res.json({ ok: true });
    }

    if (!nome || !isEmail(email) || onlyDigits(telefone).length < 10 || !mensagem || mensagem.trim().length < 5) {
      return res.status(400).json({ ok: false, error: "Dados inválidos." });
    }

    const [result] = await pool.query(
      `INSERT INTO contatos (nome, email, telefone, mensagem, origem, status)
       VALUES (?, ?, ?, ?, ?, 'pendente')`,
      [nome.trim(), email.trim(), telefone.trim(), mensagem.trim(), origem]
    );

    return res.status(201).json({ ok: true, id: result.insertId });
  } catch (err) {
    console.error("criarContato:", err);
    return res.status(500).json({ ok: false, error: "Erro ao salvar contato." });
  }
}

module.exports = { criarContato };