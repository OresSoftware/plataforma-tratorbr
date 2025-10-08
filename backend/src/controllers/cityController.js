// backend/src/controllers/cityController.js
const pool = require("../config/db");

// GET /api/admin/cities?busca=termo
async function listarCidades(req, res) {
  try {
    const busca = req.query.busca || '';
    
    let whereClauses = ['1=1'];
    const params = [];

    if (busca.trim()) {
      whereClauses.push('(name LIKE ? OR code LIKE ?)');
      const buscaParam = `%${busca}%`;
      params.push(buscaParam, buscaParam);
    }

    const whereSql = whereClauses.join(' AND ');

    const [rows] = await pool.query(
      `SELECT city_id, name, code
         FROM ocbr_city
        WHERE ${whereSql}
        ORDER BY name ASC
        LIMIT 500`,
      params
    );

    res.json({ ok: true, data: rows });
  } catch (e) {
    console.error("listarCidades:", e);
    res.status(500).json({ ok: false, error: "Erro ao listar cidades." });
  }
}

module.exports = {
  listarCidades,
};
