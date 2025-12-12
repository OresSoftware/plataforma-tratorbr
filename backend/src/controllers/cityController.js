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

// GET /api/admin/cargos
async function listarCargos(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT cargo_id, name
         FROM ocbr_cargo
        WHERE status = 1 AND cargo_id > 0
        ORDER BY name ASC`
    );

    res.json({ ok: true, data: rows });
  } catch (e) {
    console.error("listarCargos:", e);
    res.status(500).json({ ok: false, error: "Erro ao listar cargos." });
  }
}

// GET /api/admin/ocupacoes
async function listarOcupacoes(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT ocupacao_id, name
         FROM ocbr_ocupacao
        WHERE status = 1 AND ocupacao_id > 0
        ORDER BY name ASC`
    );

    res.json({ ok: true, data: rows });
  } catch (e) {
    console.error("listarOcupacoes:", e);
    res.status(500).json({ ok: false, error: "Erro ao listar ocupações." });
  }
}

module.exports = {
  listarCidades,
  listarCargos,
  listarOcupacoes,
};