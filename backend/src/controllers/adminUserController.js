const { getValidatedOrderBy } = require("../config/sortAllowLists");
const pool = require("../config/db");
const bcrypt = require('bcrypt');
const {
  buildEnterpriseScopeFilter,
  canAccessEnterpriseId,
  canManageTargetUser,
  canViewTargetUser,
  isGlobalGroup,
  isManagerGroup,
  isStandardGroup,
  normalizeCargoPower,
  resolveAccessScope,
} = require("../services/panelAuthService");

const soNumeros = (str) => String(str || '').replace(/\D/g, '');
const isISODate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || '').trim());

async function getTargetUserContext(userId) {
  const [[user]] = await pool.query(
    `
      SELECT
        u.user_id,
        u.enterprise_id,
        COALESCE(NULLIF(ent.matriz_id, 0), ent.enterprise_id) AS enterprise_matriz_id,
        u.cargo_id,
        u.user_group_id,
        COALESCE(c.cargo_poder, -1) AS cargo_poder
      FROM ocbr_user u
      LEFT JOIN ocbr_cargo c ON c.cargo_id = u.cargo_id
      LEFT JOIN ocbr_enterprise ent ON ent.enterprise_id = u.enterprise_id
      WHERE u.user_id = ?
      LIMIT 1
    `,
    [userId]
  );

  return user || null;
}

async function getCargoContext(cargoId) {
  if (!cargoId) return null;

  const [[cargo]] = await pool.query(
    `
      SELECT cargo_id, name, COALESCE(cargo_poder, -1) AS cargo_poder
      FROM ocbr_cargo
      WHERE cargo_id = ?
      LIMIT 1
    `,
    [cargoId]
  );

  return cargo || null;
}

async function getUserGroupContext(userGroupId) {
  if (!userGroupId) return null;

  const [[userGroup]] = await pool.query(
    `
      SELECT user_group_id, name
      FROM ocbr_user_group
      WHERE user_group_id = ?
      LIMIT 1
    `,
    [userGroupId]
  );

  return userGroup || null;
}

async function validateUserAccessLevelCombination({ cargoId, userGroupId }) {
  const normalizedUserGroupId = Number(userGroupId || 0);
  const normalizedCargoId = Number(cargoId || 0);

  if (!normalizedUserGroupId || !normalizedCargoId) {
    return null;
  }

  const cargo = await getCargoContext(normalizedCargoId);
  if (!cargo) {
    return { ok: false, error: 'Nível de Acesso inválido.' };
  }

  if (normalizeCargoPower(cargo.cargo_poder, -1) < 2 && normalizedUserGroupId !== 4) {
    return {
      ok: false,
      error:
        'Usuários com Nível de Acesso menor que 2 devem ser cadastrados como Usuário Padrão.',
    };
  }

  if (normalizedUserGroupId === 4 && normalizeCargoPower(cargo.cargo_poder, -1) >= 2) {
    return {
      ok: false,
      error:
        'Usuários do grupo Padrão devem possuir Nível de Acesso menor que 2. Ajuste o grupo do usuário ou selecione um nível de acesso compatível.',
    };
  }

  return { ok: true, cargo };
}

function ensureManagerScope(req, res) {
  const scope = resolveAccessScope(req.admin);

  if (!req.admin?.user_id || !scope) {
    res.status(403).json({ ok: false, error: "Sessão inválida para gerenciar usuários." });
    return null;
  }

  if (scope.mode === "global") {
    return scope;
  }

  if (scope.mode === "manager") {
    if (!scope.scopeValue || scope.cargoPower < 0) {
      res.status(403).json({ ok: false, error: "Seu usuário não possui escopo válido para gerenciar usuários." });
      return null;
    }

    return scope;
  }

  if (scope.mode === "self") {
    return scope;
  }

  res.status(403).json({ ok: false, error: "Grupo de usuário sem acesso ao gerenciamento do painel." });
  return null;
}

function buildUserVisibilityScope(scope) {
  if (scope.mode === "global") {
    return {
      where: ["1=1"],
      params: [],
    };
  }

  if (scope.mode === "manager") {
    const enterpriseScope = buildEnterpriseScopeFilter(scope, {
      enterpriseIdColumn: "u.enterprise_id",
      enterpriseTableAlias: "e",
    });

    return {
      where: [
        `(u.user_id = ? OR (${enterpriseScope.where} AND COALESCE(c.cargo_poder, -1) < ?))`,
      ],
      params: [scope.selfUserId, ...enterpriseScope.params, scope.cargoPower],
    };
  }

  return {
    where: ["u.user_id = ?"],
    params: [scope.selfUserId],
  };
}

function stripImmutableFields(payload) {
  delete payload.user_id;
  delete payload.password;
  delete payload.salt;
  delete payload.tmp_password;
  delete payload.empresa_nome;
  delete payload.cargo_nome;
  delete payload.cargo_poder;
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
  delete payload.username;
  delete payload.image;
  delete payload.plano_id;
  delete payload.sequencial;
}

function stripRestrictedSelfFields(payload) {
  delete payload.enterprise_id;
  delete payload.cargo_id;
  delete payload.user_group_id;
  delete payload.status;
}

function stripRestrictedManagedFields(payload) {
  delete payload.user_group_id;
}

function stripRestrictedStandardFields(payload) {
  delete payload.enterprise_id;
  delete payload.cargo_id;
  delete payload.ocupacao_id;
  delete payload.user_group_id;
}

function canChangeSensitiveUserState(currentUser, targetUser) {
  if (!currentUser?.user_id || !targetUser?.user_id) return false;
  if (isGlobalGroup(currentUser)) return true;
  if (Number(currentUser.user_id) === Number(targetUser.user_id)) return false;
  if (isStandardGroup(currentUser)) return false;
  return isManagerGroup(currentUser) && canManageTargetUser(currentUser, targetUser);
}

/* GET /api/admin/users */
async function listarUsuarios(req, res) {
  try {
    const scope = ensureManagerScope(req, res);
    if (!scope) return;

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const pageSize = Math.min(100, Math.max(5, parseInt(req.query.pageSize || "20", 10)));
    const offset = (page - 1) * pageSize;

    const status = String(req.query.status || 'todos').toLowerCase(); // 'todos' | 'ativos' | 'inativos'
    const busca = String(req.query.busca || '').trim();

    // filtros por relacionamento
    const enterpriseId = parseInt(req.query.enterprise_id ?? '', 10);
    const cargoId = parseInt(req.query.cargo_id ?? '', 10);
    const cityId = parseInt(req.query.city_id ?? '', 10);

    // período (date_added)
    const dateFrom = String(req.query.date_from || '').trim();
    const dateTo = String(req.query.date_to || '').trim();

    // Ordenação - PROTEGIDO CONTRA SQL INJECTION
    const rawSort = String(req.query.sort || 'name_asc').toLowerCase();
    const orderSql = getValidatedOrderBy(rawSort, 'users', 'name_asc');

    const visibility = buildUserVisibilityScope(scope);
    const where = [...visibility.where];
    const params = [...visibility.params];

    // status
    if (status === 'ativos') where.push('u.status = 1');
    if (status === 'inativos') where.push('u.status = 0');

    // empresa/cargo/cidade
    if (!Number.isNaN(enterpriseId)) {
      if (scope.mode === "manager") {
        const canAccessEnterprise = await canAccessEnterpriseId(req.admin, enterpriseId);
        if (!canAccessEnterprise) {
          return res.status(403).json({
            ok: false,
            error: "Você só pode visualizar usuários dentro do seu escopo permitido.",
          });
        }
      }
      if (scope.mode === "self") {
        return res.status(403).json({ ok: false, error: "Seu usuário só pode visualizar o próprio cadastro." });
      }
      where.push('u.enterprise_id = ?');
      params.push(enterpriseId);
    }
    if (!Number.isNaN(cargoId)) {
      if (scope.mode === "self") {
        return res.status(403).json({ ok: false, error: "Seu usuário só pode visualizar o próprio cadastro." });
      }
      where.push('u.cargo_id = ?');
      params.push(cargoId);
    }
    if (!Number.isNaN(cityId)) {
      if (scope.mode === "self") {
        return res.status(403).json({ ok: false, error: "Seu usuário só pode visualizar o próprio cadastro." });
      }
      where.push('u.city_id = ?');
      params.push(cityId);
    }

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
         COALESCE(c.cargo_poder, -1) AS cargo_poder,
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

/* GET /api/admin/users/:id */
async function buscarUsuarioPorId(req, res) {
  try {
    const scope = ensureManagerScope(req, res);
    if (!scope) return;

    const { id } = req.params;
    const target = await getTargetUserContext(id);

    if (!target) {
      return res.status(404).json({ ok: false, error: 'Usuário não encontrado.' });
    }

    if (!canViewTargetUser(req.admin, target)) {
      return res.status(403).json({ ok: false, error: 'Você não pode visualizar este usuário.' });
    }

    const [[user]] = await pool.query(
      `SELECT 
         u.*,
         e.fantasia AS empresa_nome,
         c.name     AS cargo_nome,
         COALESCE(c.cargo_poder, -1) AS cargo_poder,
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

/* PUT /api/admin/users/:id */
async function atualizarUsuario(req, res) {
  try {
    const scope = ensureManagerScope(req, res);
    if (!scope) return;

    const { id } = req.params;
    const payload = { ...req.body };
    const target = await getTargetUserContext(id);
    const isSelf = Number(req.admin?.user_id) === Number(id);

    if (!target) {
      return res.status(404).json({ ok: false, error: 'Usuário não encontrado.' });
    }

    if (!canManageTargetUser(req.admin, target)) {
      return res.status(403).json({ ok: false, error: 'Você não pode editar este usuário.' });
    }

    stripImmutableFields(payload);

    if (isGlobalGroup(req.admin)) {
      if ("user_group_id" in payload) {
        const nextUserGroupId = Number(payload.user_group_id || 0);
        if (!nextUserGroupId) {
          return res.status(400).json({ ok: false, error: 'Grupo de usuário inválido.' });
        }

        const userGroup = await getUserGroupContext(nextUserGroupId);
        if (!userGroup) {
          return res.status(400).json({ ok: false, error: 'Grupo de usuário inválido.' });
        }

        payload.user_group_id = nextUserGroupId;
      }
    } else {
      if (isStandardGroup(req.admin) && isSelf) {
        stripRestrictedStandardFields(payload);
        delete payload.status;
      } else if (isSelf) {
        stripRestrictedSelfFields(payload);
      } else {
        stripRestrictedManagedFields(payload);
      }
    }

    if (scope.mode === "manager" && !isSelf) {
      if ("enterprise_id" in payload) {
        const nextEnterpriseId = Number(payload.enterprise_id || target.enterprise_id || 0);
        const canAccessEnterprise = await canAccessEnterpriseId(req.admin, nextEnterpriseId);
        if (!canAccessEnterprise) {
          return res.status(403).json({
            ok: false,
            error: 'Você só pode manter o usuário dentro do seu escopo permitido.',
          });
        }
        payload.enterprise_id = nextEnterpriseId;
      }

      if ("cargo_id" in payload) {
        const nextCargoId = Number(payload.cargo_id || 0);
        if (!nextCargoId) {
          payload.cargo_id = null;
        } else {
          const cargo = await getCargoContext(nextCargoId);
          if (!cargo) {
            return res.status(400).json({ ok: false, error: 'Nível de Acesso inválido.' });
          }
          if (normalizeCargoPower(cargo.cargo_poder, -1) >= scope.cargoPower) {
            return res.status(403).json({
              ok: false,
              error: 'Você não pode atribuir um Nível de Acesso igual ou maior que o seu.',
            });
          }
        }
      }
    }

    const effectiveCargoId =
      "cargo_id" in payload
        ? Number(payload.cargo_id || 0)
        : Number(target.cargo_id || 0);
    const effectiveUserGroupId =
      "user_group_id" in payload
        ? Number(payload.user_group_id || 0)
        : Number(target.user_group_id || 0);

    const accessLevelValidation = await validateUserAccessLevelCombination({
      cargoId: effectiveCargoId,
      userGroupId: effectiveUserGroupId,
    });

    if (accessLevelValidation && accessLevelValidation.ok === false) {
      return res.status(400).json({ ok: false, error: accessLevelValidation.error });
    }

    if ("city_id" in payload && (payload.city_id === "" || payload.city_id === null)) {
      payload.city_id = null;
    }

    if ("ocupacao_id" in payload && (payload.ocupacao_id === "" || payload.ocupacao_id === null)) {
      payload.ocupacao_id = null;
    }

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

/* PATCH /api/admin/users/:id/status */
async function ativarDesativarUsuario(req, res) {
  try {
    const scope = ensureManagerScope(req, res);
    if (!scope) return;

    const { id } = req.params;
    const { status } = req.body;

    if (typeof status !== 'number' || (status !== 0 && status !== 1)) {
      return res.status(400).json({ ok: false, error: "Status inválido. Use 0 ou 1." });
    }

    const [[user]] = await pool.query(
      `
        SELECT
          u.user_id,
          u.firstname,
          u.lastname,
          u.enterprise_id,
          COALESCE(NULLIF(ent.matriz_id, 0), ent.enterprise_id) AS enterprise_matriz_id,
          COALESCE(c.cargo_poder, -1) AS cargo_poder
        FROM ocbr_user u
        LEFT JOIN ocbr_cargo c ON c.cargo_id = u.cargo_id
        LEFT JOIN ocbr_enterprise ent ON ent.enterprise_id = u.enterprise_id
        WHERE u.user_id = ?
        LIMIT 1
      `,
      [id]
    );

    if (!user) {
      return res.status(404).json({ ok: false, error: 'Usuário não encontrado.' });
    }

    if (!canChangeSensitiveUserState(req.admin, user)) {
      return res.status(403).json({ ok: false, error: 'Você não pode alterar o status deste usuário.' });
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

/* POST /api/admin/users/:id/reset-password */
async function resetarSenha(req, res) {
  try {
    const scope = ensureManagerScope(req, res);
    if (!scope) return;

    const { id } = req.params;

    const [[user]] = await pool.query(
      `
        SELECT
          u.user_id,
          u.firstname,
          u.lastname,
          u.email,
          u.enterprise_id,
          COALESCE(NULLIF(ent.matriz_id, 0), ent.enterprise_id) AS enterprise_matriz_id,
          COALESCE(c.cargo_poder, -1) AS cargo_poder
        FROM ocbr_user u
        LEFT JOIN ocbr_cargo c ON c.cargo_id = u.cargo_id
        LEFT JOIN ocbr_enterprise ent ON ent.enterprise_id = u.enterprise_id
        WHERE u.user_id = ?
        LIMIT 1
      `,
      [id]
    );

    if (!user) {
      return res.status(404).json({ ok: false, error: 'Usuário não encontrado.' });
    }

    if (!canChangeSensitiveUserState(req.admin, user)) {
      return res.status(403).json({ ok: false, error: 'Você não pode resetar a senha deste usuário.' });
    }

    // Gerar senha temporária (6 dígitos)
    const novaSenha = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash da senha
    const hashedPassword = await bcrypt.hash(novaSenha, 10);

    // Segue o padrão do app: senha temporária curta
    const tmpLimite = new Date();
    tmpLimite.setMinutes(tmpLimite.getMinutes() + 15);

    await pool.query(
      'UPDATE ocbr_user SET tmp_password = ?, tmp_limite = ?, date_modified = ? WHERE user_id = ?',
      [hashedPassword, tmpLimite, new Date(), id]
    );

    // TODO: enviar e-mail com a nova senha ao usuário
    res.json({
      ok: true,
      message: `Uma nova senha foi enviada para o e-mail ${user.email}.`
    });
  } catch (e) {
    console.error("resetarSenha:", e);
    res.status(500).json({ ok: false, error: "Erro ao resetar senha." });
  }
}

/* GET /api/admin/users/contador/ativos */
async function contadorAtivos(req, res) {
  try {
    const scope = ensureManagerScope(req, res);
    if (!scope) return;

    const visibility = buildUserVisibilityScope(scope);
    const [[{ total }]] = await pool.query(
      `
        SELECT COUNT(*) AS total
        FROM ocbr_user u
        LEFT JOIN ocbr_cargo c ON c.cargo_id = u.cargo_id
        WHERE ${visibility.where.join(" AND ")}
          AND u.status = 1
      `,
      visibility.params
    );
    res.json({ ok: true, total });
  } catch (e) {
    console.error("contadorAtivos:", e);
    res.status(500).json({ ok: false, error: "Erro ao obter contador." });
  }
}

// GET /api/admin/cities
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
  listarCidades,
};
