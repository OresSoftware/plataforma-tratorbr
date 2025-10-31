// backend/src/controllers/adminUserController.js
const pool = require("../config/db");
const bcrypt = require('bcrypt');

// Helpers
const soNumeros = (str) => String(str || '').replace(/\D/g, '');
// aceita apenas YYYY-MM-DD
const isISODate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || '').trim());

/**
 * GET /api/admin/users
 */
async function listarUsuarios(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const pageSize = Math.min(100, Math.max(5, parseInt(req.query.pageSize || "20", 10)));
    const offset = (page - 1) * pageSize;

    const status = String(req.query.status || 'todos').toLowerCase(); // 'todos' | 'ativos' | 'inativos'
    const busca = String(req.query.busca || '').trim();

    // filtros por relacionamento
    const enterpriseId = parseInt(req.query.enterprise_id ?? '', 10);
    const cargoId      = parseInt(req.query.cargo_id ?? '', 10);
    const cityId       = parseInt(req.query.city_id ?? '', 10);

    // período (date_added)
    const dateFrom = String(req.query.date_from || '').trim();
    const dateTo   = String(req.query.date_to   || '').trim();

    // Ordenação
    const rawSort = String(req.query.sort || 'name_asc').toLowerCase();
    let orderSql = 'u.firstname ASC, u.lastname ASC';
    if (rawSort === 'name_desc') orderSql = 'u.firstname DESC, u.lastname DESC';
    else if (rawSort === 'date_asc') orderSql = 'u.date_added ASC, u.user_id ASC';
    else if (rawSort === 'date_desc') orderSql = 'u.date_added DESC, u.user_id DESC';

    const where = ["1=1"];
    const params = [];

    // status
    if (status === 'ativos')   where.push('u.status = 1');
    if (status === 'inativos') where.push('u.status = 0');

    // empresa/cargo/cidade
    if (!Number.isNaN(enterpriseId)) { where.push('u.enterprise_id = ?'); params.push(enterpriseId); }
    if (!Number.isNaN(cargoId))      { where.push('u.cargo_id = ?');      params.push(cargoId); }
    if (!Number.isNaN(cityId))       { where.push('u.city_id = ?');       params.push(cityId); }

    // busca
    if (busca) {
      const like = `%${busca}%`;
      const cpfDigits = soNumeros(busca);

      const subCondicoes = [
        "u.firstname LIKE ?",
        "u.lastname LIKE ?",
        "CONCAT(u.firstname, ' ', u.lastname) LIKE ?",
        "u.email LIKE ?",
        "e.fantasia LIKE ?",
        "c.name LIKE ?",
      ];
      const subParams = [like, like, like, like, like, like];

      if (cpfDigits) {
        subCondicoes.push("REPLACE(REPLACE(REPLACE(u.cpf, '.', ''), '-', ''), ' ', '') LIKE ?");
        subParams.push(`%${cpfDigits}%`);
      }

      where.push(`(${subCondicoes.join(" OR ")})`);
      params.push(...subParams);
    }

    // data (inclusivo)
    if (dateFrom && isISODate(dateFrom) && dateTo && isISODate(dateTo)) {
      where.push("u.date_added BETWEEN ? AND ?");
      params.push(`${dateFrom} 00:00:00`, `${dateTo} 23:59:59`);
    } else if (dateFrom && isISODate(dateFrom)) {
      where.push("u.date_added >= ?");
      params.push(`${dateFrom} 00:00:00`);
    } else if (dateTo && isISODate(dateTo)) {
      where.push("u.date_added <= ?");
      params.push(`${dateTo} 23:59:59`);
    }

    const whereSql = where.join(' AND ');

    // dados
    const [rows] = await pool.query(
      `SELECT 
         u.*,
         e.fantasia AS empresa_nome,
         c.name     AS cargo_nome,
         o.name     AS ocupacao_nome,
         ci.name    AS cidade_nome,
         ci.code    AS cidade_uf
       FROM ocbr_user u
       LEFT JOIN ocbr_enterprise e ON u.enterprise_id = e.enterprise_id
       LEFT JOIN ocbr_cargo      c ON u.cargo_id      = c.cargo_id
       LEFT JOIN ocbr_ocupacao   o ON u.ocupacao_id   = o.ocupacao_id
       LEFT JOIN ocbr_city       ci ON u.city_id       = ci.city_id
       WHERE ${whereSql}
       ORDER BY ${orderSql}
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    // total
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total
         FROM ocbr_user u
         LEFT JOIN ocbr_enterprise e ON u.enterprise_id = e.enterprise_id
         LEFT JOIN ocbr_cargo      c ON u.cargo_id      = c.cargo_id
         LEFT JOIN ocbr_ocupacao   o ON u.ocupacao_id   = o.ocupacao_id
         LEFT JOIN ocbr_city       ci ON u.city_id       = ci.city_id
        WHERE ${whereSql}`,
      params
    );

    res.json({ ok: true, data: rows, page, pageSize, total });
  } catch (e) {
    console.error("listarUsuarios:", e);
    res.status(500).json({ ok: false, error: "Erro ao listar usuários." });
  }
}

/**
 * GET /api/admin/users/:id
 */
async function buscarUsuarioPorId(req, res) {
  try {
    const { id } = req.params;

    const [[user]] = await pool.query(
      `SELECT 
         u.*,
         e.fantasia AS empresa_nome,
         c.name     AS cargo_nome,
         o.name     AS ocupacao_nome,
         ci.name    AS cidade_nome,
         ci.code    AS cidade_uf
       FROM ocbr_user u
       LEFT JOIN ocbr_enterprise e ON u.enterprise_id = e.enterprise_id
       LEFT JOIN ocbr_cargo      c ON u.cargo_id      = c.cargo_id
       LEFT JOIN ocbr_ocupacao   o ON u.ocupacao_id   = o.ocupacao_id
       LEFT JOIN ocbr_city       ci ON u.city_id       = ci.city_id
       WHERE u.user_id = ?`,
      [id]
    );

    if (!user) {
      return res.status(404).json({ ok: false, error: 'Usuário não encontrado.' });
    }

    // Remover campos sensíveis
    delete user.password;
    delete user.salt;
    delete user.tmp_password;

    res.json({ ok: true, data: user });
  } catch (e) {
    console.error("buscarUsuarioPorId:", e);
    res.status(500).json({ ok: false, error: "Erro ao buscar usuário." });
  }
}

/**
 * PUT /api/admin/users/:id
 */
async function atualizarUsuario(req, res) {
  try {
    const { id } = req.params;
    const payload = { ...req.body };

    // Remover campos que não devem ser atualizados diretamente
    delete payload.user_id;
    delete payload.password;
    delete payload.salt;
    delete payload.tmp_password;
    delete payload.empresa_nome;
    delete payload.cargo_nome;
    delete payload.ocupacao_nome;
    delete payload.cidade_nome;
    delete payload.cidade_uf;
    delete payload.date_added;
    delete payload.plano_valido;
    delete payload.device_id;
    delete payload.api_token;
    delete payload.code;
    delete payload.ip;
    delete payload.tmp_limite;
    delete payload.tmp_device;
    delete payload.user_group_id;
    delete payload.username;
    delete payload.image;
    delete payload.plano_id;
    delete payload.sequencial;

    // Atualizar date_modified
    payload.date_modified = new Date();

    // Validar email único (exceto o próprio registro)
    if (payload.email) {
      const [[existing]] = await pool.query(
        'SELECT user_id FROM ocbr_user WHERE email = ? AND user_id != ?',
        [payload.email, id]
      );
      if (existing) {
        return res.status(400).json({ ok: false, error: 'Email já cadastrado para outro usuário.' });
      }
    }

    await pool.query('UPDATE ocbr_user SET ? WHERE user_id = ?', [payload, id]);

    res.json({ ok: true, message: 'Usuário atualizado com sucesso!' });
  } catch (e) {
    console.error("atualizarUsuario:", e);
    res.status(500).json({ ok: false, error: "Erro ao atualizar usuário." });
  }
}

/**
 * PATCH /api/admin/users/:id/status
 */
async function ativarDesativarUsuario(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (typeof status !== 'number' || (status !== 0 && status !== 1)) {
      return res.status(400).json({ ok: false, error: "Status inválido. Use 0 ou 1." });
    }

    const [[user]] = await pool.query(
      'SELECT user_id, firstname, lastname FROM ocbr_user WHERE user_id = ?',
      [id]
    );

    if (!user) {
      return res.status(404).json({ ok: false, error: 'Usuário não encontrado.' });
    }

    await pool.query(
      'UPDATE ocbr_user SET status = ?, date_modified = ? WHERE user_id = ?',
      [status, new Date(), id]
    );

    const statusTexto = status ? 'ativado' : 'desativado';
    res.json({
      ok: true,
      message: `Usuário ${user.firstname} ${user.lastname} ${statusTexto} com sucesso!`
    });
  } catch (e) {
    console.error("ativarDesativarUsuario:", e);
    res.status(500).json({ ok: false, error: "Erro ao alterar status do usuário." });
  }
}

/**
 * POST /api/admin/users/:id/reset-password
 */
async function resetarSenha(req, res) {
  try {
    const { id } = req.params;

    const [[user]] = await pool.query(
      'SELECT user_id, firstname, lastname, email FROM ocbr_user WHERE user_id = ?',
      [id]
    );

    if (!user) {
      return res.status(404).json({ ok: false, error: 'Usuário não encontrado.' });
    }

    // Gerar senha temporária (6 dígitos)
    const novaSenha = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash da senha
    const hashedPassword = await bcrypt.hash(novaSenha, 10);

    // Definir limite de 24 horas para usar a senha temporária
    const tmpLimite = new Date();
    tmpLimite.setHours(tmpLimite.getHours() + 24);

    await pool.query(
      'UPDATE ocbr_user SET tmp_password = ?, tmp_limite = ?, date_modified = ? WHERE user_id = ?',
      [hashedPassword, tmpLimite, new Date(), id]
    );

    // TODO: enviar e-mail com a nova senha ao usuário
    res.json({
      ok: true,
      message: `Senha resetada com sucesso! Nova senha: ${novaSenha}`,
      novaSenha: novaSenha,
      email: user.email
    });
  } catch (e) {
    console.error("resetarSenha:", e);
    res.status(500).json({ ok: false, error: "Erro ao resetar senha." });
  }
}

/**
 * GET /api/admin/users/contador/ativos
 */
async function contadorAtivos(req, res) {
  try {
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM ocbr_user WHERE status = 1`
    );
    res.json({ ok: true, total });
  } catch (e) {
    console.error("contadorAtivos:", e);
    res.status(500).json({ ok: false, error: "Erro ao obter contador." });
  }
}

/**
 * GET /api/admin/cities
 * Lista de cidades para os filtros do front.
 * Query params:
 *  - q        : termo (nome da cidade OU UF)
 *  - uf       : filtra por UF exata (ex.: SP)
 *  - page     : padrão 1
 *  - pageSize : padrão 50, máx 1000, mín 5
 * Retorno: { ok, data: [{ city_id, name, code }], page, pageSize, total }
 */
async function listarCidades(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const pageSize = Math.min(1000, Math.max(5, parseInt(req.query.pageSize || "50", 10)));
    const offset = (page - 1) * pageSize;

    const q = String(req.query.q || '').trim();
    const uf = String(req.query.uf || '').trim().toUpperCase();

    const where = ["1=1"];
    const params = [];

    if (q) {
      const like = `%${q}%`;
      where.push("(ci.name LIKE ? OR ci.code LIKE ?)");
      params.push(like, like);
    }

    if (uf) {
      where.push("ci.code = ?");
      params.push(uf);
    }

    const whereSql = where.join(" AND ");

    const [rows] = await pool.query(
      `SELECT ci.city_id, ci.name, ci.code
         FROM ocbr_city ci
        WHERE ${whereSql}
        ORDER BY ci.name ASC
        LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total
         FROM ocbr_city ci
        WHERE ${whereSql}`,
      params
    );

    res.json({ ok: true, data: rows, page, pageSize, total });
  } catch (e) {
    console.error("listarCidades:", e);
    res.status(500).json({ ok: false, error: "Erro ao listar cidades." });
  }
}

module.exports = {
  listarUsuarios,
  buscarUsuarioPorId,
  atualizarUsuario,
  ativarDesativarUsuario,
  resetarSenha,
  contadorAtivos,
  // novo export:
  listarCidades,
};
