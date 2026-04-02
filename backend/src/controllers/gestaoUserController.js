const pool = require('../config/db');

async function listarUsuariosDaMesmaEmpresa(req, res) {
  try {
    const enterpriseId = req.appUser?.enterprise_id;

    if (!enterpriseId) {
      return res.status(403).json({
        ok: false,
        error: 'Empresa do usuário autenticado não encontrada.'
      });
    }

    const [rows] = await pool.query(
      `SELECT
         u.user_id,
         u.firstname,
         u.lastname,
         u.email,
         u.fone,
         u.status,
         u.enterprise_id,
         u.cargo_id,
         u.ocupacao_id,
         u.date_added,
         c.name AS cargo_nome,
         o.name AS ocupacao_nome
       FROM ocbr_user u
       LEFT JOIN ocbr_cargo c ON u.cargo_id = c.cargo_id
       LEFT JOIN ocbr_ocupacao o ON u.ocupacao_id = o.ocupacao_id
       WHERE u.enterprise_id = ?
       ORDER BY u.firstname ASC, u.lastname ASC`,
      [enterpriseId]
    );

    return res.status(200).json({
      ok: true,
      enterprise_id: enterpriseId,
      total: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('listarUsuariosDaMesmaEmpresa:', error);
    return res.status(500).json({
      ok: false,
      error: 'Erro ao listar usuários da empresa.'
    });
  }
}

module.exports = {
  listarUsuariosDaMesmaEmpresa,
};
