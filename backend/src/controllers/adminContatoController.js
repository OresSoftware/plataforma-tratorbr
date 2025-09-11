// backend/controllers/adminContatoController.js
const pool = require("../config/db"); // ajuste o caminho se seu db.js estiver em outro lugar

// GET /api/admin/contatos?status=pendente&page=1&pageSize=20
async function listarContatos(req, res) {
  try {
    const status = String(req.query.status || "pendente").toLowerCase();
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const pageSize = Math.min(100, Math.max(5, parseInt(req.query.pageSize || "20", 10)));
    const offset = (page - 1) * pageSize;

    const where =
      status === "todos" ? "deleted_at IS NULL" : "status = ? AND deleted_at IS NULL";
    const params = status === "todos" ? [] : [status];

    const [rows] = await pool.query(
      `SELECT id, nome, email, telefone, mensagem, status, created_at
         FROM contatos
        WHERE ${where}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?`,
      status === "todos" ? [pageSize, offset] : [...params, pageSize, offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM contatos WHERE ${where}`,
      params
    );

    res.json({ ok: true, data: rows, page, pageSize, total });
  } catch (e) {
    console.error("listarContatos:", e);
    res.status(500).json({ ok: false, error: "Erro ao listar contatos." });
  }
}

// PATCH /api/admin/contatos/:id/respondido
async function marcarRespondido(req, res) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ ok: false, error: "ID inválido." });

    const adminId = (req.admin && req.admin.id) || null; // vem do middleware verificarAdmin
    await pool.query(
      `UPDATE contatos
          SET status='respondido', responded_at=NOW(), responded_by=?
        WHERE id=? AND deleted_at IS NULL`,
      [adminId, id]
    );

    res.json({ ok: true });
  } catch (e) {
    console.error("marcarRespondido:", e);
    res.status(500).json({ ok: false, error: "Erro ao atualizar contato." });
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

    // se preferir hard delete, troque pela linha abaixo:
    // await pool.query(`DELETE FROM contatos WHERE id=?`, [id]);

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
