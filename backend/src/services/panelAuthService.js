const axios = require("axios");
const pool = require("../config/db");

const USER_GROUPS = {
  ADMINISTRADORES: 1,
  FUNCIONARIOS: 2,
  USUARIOS_GERENTE: 3,
  USUARIOS_PADRAO: 4,
};

function getDefaultPanelHomePath(user = {}) {
  return isGlobalGroup(user) ? "/admin/growth" : "/admin/dashboard";
}

function getPanelJwtSecret() {
  return process.env.JWT_KEY || process.env.JWT_SECRET;
}

function normalizeUserGroupId(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeCargoPower(value, fallback = -1) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeEnterpriseId(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getEffectiveMatrixId(target = {}) {
  return normalizeEnterpriseId(
    target.enterprise_matriz_id || target.matriz_id || target.enterprise_id
  );
}

function isGlobalGroup(user = {}) {
  const groupId = normalizeUserGroupId(user.user_group_id);
  return groupId === USER_GROUPS.ADMINISTRADORES || groupId === USER_GROUPS.FUNCIONARIOS;
}

function isManagerGroup(user = {}) {
  return normalizeUserGroupId(user.user_group_id) === USER_GROUPS.USUARIOS_GERENTE;
}

function isStandardGroup(user = {}) {
  return normalizeUserGroupId(user.user_group_id) === USER_GROUPS.USUARIOS_PADRAO;
}

function hasLinkedEnterprise(user = {}) {
  return normalizeEnterpriseId(user.enterprise_id) > 0;
}

function isMatrixManager(user = {}) {
  return isManagerGroup(user) && normalizeCargoPower(user.cargo_poder, -1) === 5;
}

function canAccessEnterprises(user = {}) {
  return isGlobalGroup(user) || isManagerGroup(user) || (isStandardGroup(user) && hasLinkedEnterprise(user));
}

function getAllowedPages(user = {}) {
  const pages = new Set();
  const groupId = normalizeUserGroupId(user.user_group_id);

  if (
    groupId === USER_GROUPS.ADMINISTRADORES ||
    groupId === USER_GROUPS.FUNCIONARIOS
  ) {
    pages.add("growth");
    pages.add("dashboard");
    pages.add("usuarios");
    pages.add("empresas");
    pages.add("contatos");
    return Array.from(pages);
  }

  if (groupId === USER_GROUPS.USUARIOS_GERENTE) {
    pages.add("dashboard");
    pages.add("usuarios");
    pages.add("empresas");
    return Array.from(pages);
  }

  if (groupId === USER_GROUPS.USUARIOS_PADRAO) {
    pages.add("dashboard");
    pages.add("usuarios");
    if (hasLinkedEnterprise(user)) {
      pages.add("empresas");
    }
  }

  return Array.from(pages);
}

function buildPanelSession(user = {}) {
  const allowedPages = getAllowedPages(user);
  const enterpriseId = normalizeEnterpriseId(user.enterprise_id);
  const enterpriseMatrixId = getEffectiveMatrixId({
    enterprise_id: enterpriseId,
    enterprise_matriz_id: user.enterprise_matriz_id,
  });

  return {
    user_id: user.user_id,
    email: user.email,
    username: user.username || user.email,
    firstname: user.firstname,
    lastname: user.lastname,
    image: user.image,
    nome: user.firstname,
    sobrenome: user.lastname,
    enterprise_id: enterpriseId,
    enterprise_matriz_id: enterpriseMatrixId,
    enterprise_fantasia: user.enterprise_fantasia,
    enterprise_razao: user.enterprise_razao,
    enterprise_image_logo: user.enterprise_image_logo,
    enterprise_image_logo_site: user.enterprise_image_logo_site,
    enterprise_matriz_fantasia: user.enterprise_matriz_fantasia,
    enterprise_matriz_razao: user.enterprise_matriz_razao,
    cargo_id: user.cargo_id,
    cargo_name: user.cargo_name,
    cargo_poder: normalizeCargoPower(user.cargo_poder, -1),
    user_group_id: normalizeUserGroupId(user.user_group_id),
    user_group_name: user.user_group_name,
    user_group_permission: user.user_group_permission,
    status: user.status,
    home_path: getDefaultPanelHomePath(user),
    permissoes: allowedPages,
    allowedPages,
  };
}

async function getPanelUserById(userId) {
  if (!userId) return null;

  const [[user]] = await pool.query(
    `
      SELECT
        u.user_id,
        u.email,
        u.username,
        u.firstname,
        u.lastname,
        u.fone,
        u.enterprise_id,
        COALESCE(NULLIF(ent.matriz_id, 0), ent.enterprise_id) AS enterprise_matriz_id,
        u.enterprise_razao,
        u.enterprise_fantasia,
        mat.fantasia AS enterprise_matriz_fantasia,
        mat.razao AS enterprise_matriz_razao,
        u.cargo_id,
        u.cargo_name,
        u.cargo_poder,
        u.ocupacao_id,
        u.ocupacao_name,
        u.user_group_id,
        u.status,
        u.image,
        u.image_logo,
        u.image_logo_site,
        u.enterprise_image,
        u.enterprise_image_logo,
        u.enterprise_image_logo_site,
        u.enterprise_representada_image,
        u.enterprise_representada_image_logo,
        u.enterprise_representada_image_logo_site,
        u.enterprise_email,
        u.enterprise_fone,
        u.enterprise_cnpj,
        u.enterprise_cidade,
        u.enterprise_uf,
        u.cpf,
        u.city_id,
        u.city_name,
        u.city_uf,
        u.date_added,
        u.date_modified,
        u.plano_id,
        u.plano_valido,
        ug.name AS user_group_name,
        ug.permission AS user_group_permission
      FROM app_user u
      LEFT JOIN ocbr_user_group ug ON ug.user_group_id = u.user_group_id
      LEFT JOIN ocbr_enterprise ent ON ent.enterprise_id = u.enterprise_id
      LEFT JOIN ocbr_enterprise mat ON mat.enterprise_id = COALESCE(NULLIF(ent.matriz_id, 0), ent.enterprise_id)
      WHERE u.user_id = ?
      LIMIT 1
    `,
    [userId]
  );

  return user || null;
}

async function getPanelUserByIdentifier(identifier) {
  const normalized = String(identifier || "").trim().toLowerCase();
  if (!normalized) return null;

  const [[user]] = await pool.query(
    `
      SELECT
        u.user_id,
        u.email,
        u.username,
        u.password,
        u.tmp_password,
        u.tmp_limite,
        u.firstname,
        u.lastname,
        u.fone,
        u.enterprise_id,
        COALESCE(NULLIF(ent.matriz_id, 0), ent.enterprise_id) AS enterprise_matriz_id,
        u.enterprise_razao,
        u.enterprise_fantasia,
        mat.fantasia AS enterprise_matriz_fantasia,
        mat.razao AS enterprise_matriz_razao,
        u.cargo_id,
        u.cargo_name,
        u.cargo_poder,
        u.ocupacao_id,
        u.ocupacao_name,
        u.user_group_id,
        u.status,
        u.image,
        u.image_logo,
        u.image_logo_site,
        u.enterprise_image,
        u.enterprise_image_logo,
        u.enterprise_image_logo_site,
        u.enterprise_representada_image,
        u.enterprise_representada_image_logo,
        u.enterprise_representada_image_logo_site,
        u.enterprise_email,
        u.enterprise_fone,
        u.enterprise_cnpj,
        u.enterprise_cidade,
        u.enterprise_uf,
        u.cpf,
        u.city_id,
        u.city_name,
        u.city_uf,
        u.date_added,
        u.date_modified,
        u.plano_id,
        u.plano_valido,
        ug.name AS user_group_name,
        ug.permission AS user_group_permission
      FROM app_user u
      LEFT JOIN ocbr_user_group ug ON ug.user_group_id = u.user_group_id
      LEFT JOIN ocbr_enterprise ent ON ent.enterprise_id = u.enterprise_id
      LEFT JOIN ocbr_enterprise mat ON mat.enterprise_id = COALESCE(NULLIF(ent.matriz_id, 0), ent.enterprise_id)
      WHERE LOWER(u.email) = ?
         OR LOWER(u.username) = ?
      LIMIT 1
    `,
    [normalized, normalized]
  );

  return user || null;
}

async function verifyTurnstileToken(token, remoteip) {
  const secret =
    process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY ||
    process.env.TURNSTILE_SECRET_KEY ||
    "";
  const hasSecret = Boolean(secret);
  const hasToken = Boolean(token);
  const sanitizedRemoteIp = String(remoteip || "").split(",")[0].trim() || null;

  console.info("[Turnstile] Iniciando validacao", {
    hasSecret,
    hasToken,
    remoteip: sanitizedRemoteIp,
  });

  if (!secret) {
    const result = { enabled: true, success: false, reason: "not_configured" };
    console.warn("[Turnstile] Secret key ausente", result);
    return result;
  }

  if (!token) {
    const result = { enabled: true, success: false, reason: "missing_token" };
    console.warn("[Turnstile] Token ausente", result);
    return result;
  }

  const params = new URLSearchParams();
  params.append("secret", secret);
  params.append("response", token);
  if (sanitizedRemoteIp) params.append("remoteip", sanitizedRemoteIp);

  try {
    const response = await axios.post(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 10000,
        validateStatus: () => true,
      }
    );

    const body = response?.data || {};
    const errors = Array.isArray(body?.["error-codes"]) ? body["error-codes"] : [];
    const result = {
      enabled: true,
      success: Boolean(body?.success),
      reason: body?.success ? "ok" : "siteverify_failed",
      errors,
      body,
      httpStatus: response.status,
    };

    if (errors.includes("timeout-or-duplicate")) {
      result.reason = "timeout_or_duplicate";
    } else if (errors.includes("invalid-input-response") || errors.includes("missing-input-response")) {
      result.reason = "invalid_token";
    } else if (errors.includes("invalid-input-secret") || errors.includes("missing-input-secret")) {
      result.reason = "invalid_secret";
    }

    console.info("[Turnstile] Resposta do siteverify", {
      httpStatus: response.status,
      body,
      reason: result.reason,
    });

    return result;
  } catch (error) {
    const result = {
      enabled: true,
      success: false,
      reason: "request_failed",
      message: error.message,
      code: error.code,
      httpStatus: error.response?.status || null,
      body: error.response?.data || null,
    };

    console.error("[Turnstile] Falha na chamada ao siteverify", result);
    return result;
  }
}

async function getEnterpriseContextById(enterpriseId) {
  const normalizedEnterpriseId = normalizeEnterpriseId(enterpriseId);
  if (!normalizedEnterpriseId) return null;

  const [[enterprise]] = await pool.query(
    `
      SELECT
        e.enterprise_id,
        e.matriz_id,
        e.matriz_filial,
        e.ativo,
        COALESCE(NULLIF(e.matriz_id, 0), e.enterprise_id) AS enterprise_matriz_id
      FROM ocbr_enterprise e
      WHERE e.enterprise_id = ?
      LIMIT 1
    `,
    [normalizedEnterpriseId]
  );

  return enterprise || null;
}

function resolveAccessScope(user = {}) {
  const selfUserId = normalizeEnterpriseId(user.user_id);
  const enterpriseId = normalizeEnterpriseId(user.enterprise_id);
  const enterpriseMatrixId = getEffectiveMatrixId({
    enterprise_id: enterpriseId,
    enterprise_matriz_id: user.enterprise_matriz_id,
  });
  const cargoPower = normalizeCargoPower(user.cargo_poder, -1);

  if (isGlobalGroup(user)) {
    return {
      mode: "global",
      selfUserId,
      enterpriseId,
      enterpriseMatrixId,
      cargoPower,
      scopeType: "global",
      scopeValue: null,
    };
  }

  if (isStandardGroup(user)) {
    return {
      mode: "self",
      selfUserId,
      enterpriseId,
      enterpriseMatrixId,
      cargoPower,
      scopeType: "self",
      scopeValue: selfUserId || null,
      enterpriseScopeType: enterpriseId ? "enterprise" : "none",
      enterpriseScopeValue: enterpriseId || null,
    };
  }

  if (!enterpriseId) {
    return null;
  }

  const scopeType = isMatrixManager(user) ? "matriz" : "enterprise";
  const scopeValue = scopeType === "matriz" ? enterpriseMatrixId : enterpriseId;

  return {
    mode: isManagerGroup(user) ? "manager" : "scoped",
    selfUserId,
    enterpriseId,
    enterpriseMatrixId,
    cargoPower,
    scopeType,
    scopeValue,
  };
}

function buildEnterpriseScopeFilter(
  scope,
  { enterpriseIdColumn, enterpriseTableAlias }
) {
  if (!scope || scope.mode === "global") {
    return {
      where: "1=1",
      params: [],
    };
  }

  if (scope.mode === "self") {
    if (!scope.enterpriseScopeValue) {
      return {
        where: "1=0",
        params: [],
      };
    }

    return {
      where: `${enterpriseIdColumn} = ?`,
      params: [scope.enterpriseScopeValue],
    };
  }

  if (scope.scopeType === "matriz") {
    if (!enterpriseTableAlias) {
      throw new Error("enterpriseTableAlias é obrigatório para escopo por matriz.");
    }

    return {
      where: `COALESCE(NULLIF(${enterpriseTableAlias}.matriz_id, 0), ${enterpriseTableAlias}.enterprise_id) = ?`,
      params: [scope.scopeValue],
    };
  }

  return {
    where: `${enterpriseIdColumn} = ?`,
    params: [scope.scopeValue],
  };
}

function isTargetWithinScope(scope, target = {}) {
  if (!scope) return false;
  if (scope.mode === "global") return true;
  if (scope.mode === "self") {
    if (!scope.enterpriseScopeValue) return false;
    const targetEnterpriseId = normalizeEnterpriseId(target.enterprise_id);
    return Boolean(targetEnterpriseId) && targetEnterpriseId === scope.enterpriseScopeValue;
  }

  const targetEnterpriseId = normalizeEnterpriseId(target.enterprise_id);
  const targetMatrixId = getEffectiveMatrixId(target);

  if (scope.scopeType === "matriz") {
    return Boolean(targetMatrixId) && targetMatrixId === scope.scopeValue;
  }

  return Boolean(targetEnterpriseId) && targetEnterpriseId === scope.scopeValue;
}

async function canAccessEnterpriseId(user = {}, enterpriseId) {
  const scope = resolveAccessScope(user);
  if (!scope) return false;
  if (scope.mode === "global") return true;
  if (scope.mode === "self") return false;

  const targetEnterprise = await getEnterpriseContextById(enterpriseId);
  if (!targetEnterprise) return false;

  return isTargetWithinScope(scope, targetEnterprise);
}

function canManageTargetUser(currentUser, targetUser) {
  if (!currentUser?.user_id || !targetUser?.user_id) return false;
  const scope = resolveAccessScope(currentUser);

  if (!scope) return false;
  if (scope.mode === "global") return true;
  if (Number(currentUser.user_id) === Number(targetUser.user_id)) return true;
  if (scope.mode === "self") return false;
  if (!isManagerGroup(currentUser)) return false;
  if (!isTargetWithinScope(scope, targetUser)) return false;

  const currentPower = normalizeCargoPower(currentUser.cargo_poder, -1);
  const targetPower = normalizeCargoPower(targetUser.cargo_poder, -1);

  return targetPower < currentPower;
}

function canViewTargetUser(currentUser, targetUser) {
  return canManageTargetUser(currentUser, targetUser);
}

module.exports = {
  USER_GROUPS,
  buildPanelSession,
  canAccessEnterprises,
  canViewTargetUser,
  canManageTargetUser,
  getDefaultPanelHomePath,
  getAllowedPages,
  getPanelJwtSecret,
  getPanelUserById,
  getPanelUserByIdentifier,
  hasLinkedEnterprise,
  isGlobalGroup,
  isMatrixManager,
  isManagerGroup,
  isStandardGroup,
  buildEnterpriseScopeFilter,
  canAccessEnterpriseId,
  getEnterpriseContextById,
  getEffectiveMatrixId,
  normalizeCargoPower,
  normalizeEnterpriseId,
  normalizeUserGroupId,
  resolveAccessScope,
  verifyTurnstileToken,
};
