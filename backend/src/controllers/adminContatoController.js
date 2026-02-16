const { getValidatedOrderBy } = require("../config/sortAllowLists");
const pool = require("../config/db");

async function listarContatos(req, res) {
  try {
    const status = String(req.query.status || "pendente").toLowerCase();
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const pageSize = Math.min(100, Math.max(5, parseInt(req.query.pageSize || "20", 10)));
    const offset = (page - 1) * pageSize;

    let where = "deleted_at IS NULL";
    const params = [];

    if (status !== "todos") {
      where += " AND status = ?";
      params.push(status);
    }

    const orderBy = getValidatedOrderBy(status, 'contatos', 'pendente');

    const [rows] = await pool.query(
      `SELECT id, nome, email, telefone, mensagem, status, created_at, responded_at, responded_by, response_channel
       FROM contatos
       WHERE ${where}
       ${orderBy}
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM contatos WHERE ${where}`,
      params
    );

    return res.json({ ok: true, data: rows, page, pageSize, total });
  } catch (e) {
    console.error("listarContatos:", e);
    return res.status(500).json({ ok: false, error: "Erro ao listar contatos." });
  }
}

// PATCH /api/admin/contatos/:id/respondido
async function marcarRespondido(req, res) {
  try {
    const id = Number(req.params.id);
    const canal = String(req.body?.canal || "").toLowerCase();

    if (!id || !['email', 'whatsapp'].includes(canal)) {
      return res.status(400).json({ ok: false, error: "Canal inválido. Use 'email' ou 'whatsapp'." });
    }

    // Quem está marcando (vem do middleware de admin autenticado)
    const adminId = req.admin?.id || null;

    const [result] = await pool.query(
      `UPDATE contatos
          SET status='respondido',
              responded_at = NOW(),
              responded_by = ?,
              response_channel = ?
        WHERE id = ? AND deleted_at IS NULL`,
      [adminId, canal, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "Contato não encontrado ou já excluído." });
    }

    return res.json({ ok: true });
  } catch (e) {
    console.error("marcarRespondido:", e);
    return res.status(500).json({ ok: false, error: "Erro ao marcar respondido." });
  }
}


// DELETE /api/admin/contatos/:id  (hard delete ou soft delete)
async function excluirContato(req, res) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ ok: false, error: "ID inválido." });

    // soft delete (recomendado):
    await pool.query(
      `UPDATE contatos SET deleted_at=NOW() WHERE id=? AND deleted_at IS NULL`,
      [id]
    );

    res.json({ ok: true });
  } catch (e) {
    console.error("excluirContato:", e);
    res.status(500).json({ ok: false, error: "Erro ao excluir contato." });
  }
}

// GET /api/admin/contatos/contador
async function contadorPendentes(req, res) {
  try {
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total
         FROM contatos
        WHERE status='pendente' AND deleted_at IS NULL`
    );
    res.json({ ok: true, total });
  } catch (e) {
    console.error("contadorPendentes:", e);
    res.status(500).json({ ok: false, error: "Erro ao obter contador." });
  }
}

module.exports = {
  listarContatos,
  marcarRespondido,
  excluirContato,
  contadorPendentes,
};
