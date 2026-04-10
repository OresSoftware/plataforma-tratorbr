const jwt = require("jsonwebtoken");
const { resolveAccessScope } = require("./panelAuthService");

function normalizeEvaluationModule(moduleType) {
  return String(moduleType || "").toLowerCase() === "checkbr" ? "checkbr" : "tabelabr";
}

function buildEvaluationModuleFilter(moduleType, alias = "av") {
  const normalizedModule = normalizeEvaluationModule(moduleType);

  if (normalizedModule === "checkbr") {
    return {
      moduleType: normalizedModule,
      where: `COALESCE(${alias}.checklist_id, 0) > 0`,
      params: [],
    };
  }

  return {
    moduleType: normalizedModule,
    where: `COALESCE(${alias}.checklist_id, 0) = 0`,
    params: [],
  };
}

function buildEvaluationEnterpriseScopeFilter(scope, alias = "av") {
  if (!scope || scope.mode === "global") {
    return {
      where: "1=1",
      params: [],
    };
  }

  if (scope.scopeType === "matriz") {
    return {
      where: `COALESCE(NULLIF(${alias}.enterprise_matriz_id, 0), ${alias}.enterprise_id) = ?`,
      params: [scope.scopeValue],
    };
  }

  return {
    where: `${alias}.enterprise_id = ?`,
    params: [scope.scopeValue],
  };
}

function buildEvaluationVisibilityFilter(currentUser, { alias = "av" } = {}) {
  const scope = resolveAccessScope(currentUser);

  if (!currentUser?.user_id || !scope) {
    return null;
  }

  if (scope.mode === "global") {
    return {
      scope,
      where: "1=1",
      params: [],
    };
  }

  if (scope.mode === "self") {
    return {
      scope,
      where: `${alias}.user_id = ?`,
      params: [scope.selfUserId],
    };
  }

  const enterpriseScope = buildEvaluationEnterpriseScopeFilter(scope, alias);

  if (scope.mode === "manager") {
    return {
      scope,
      where: `(${alias}.user_id = ? OR (${enterpriseScope.where} AND COALESCE(${alias}.user_cargo_poder, -1) < ?))`,
      params: [scope.selfUserId, ...enterpriseScope.params, scope.cargoPower],
    };
  }

  return {
    scope,
    where: enterpriseScope.where,
    params: enterpriseScope.params,
  };
}

function isCheckBrEvaluation(evaluation = {}) {
  return Number(evaluation.checklist_id || 0) > 0;
}

function getEvaluationDisplayId(evaluation = {}) {
  const userId = Number(evaluation.user_id || 0);
  const avaliadorId = Number(evaluation.avaliador_id || 0);

  if (!userId || !avaliadorId) {
    return String(avaliadorId || "");
  }

  return `${userId}.${avaliadorId}`;
}

function getPdfRouteByEvaluation(evaluation = {}) {
  return isCheckBrEvaluation(evaluation)
    ? "/generate-pdf-checklist"
    : "/generate-pdf-avaliador";
}

function getAppPdfBaseUrls() {
  const configured = String(
    process.env.APP_PDF_BASE_URLS ||
      process.env.APP_PDF_BASE_URL ||
      ""
  )
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const urls = [...configured, "https://app.tratorbr.com"];
  return Array.from(new Set(urls));
}

function signAppPdfToken(user = {}) {
  const jwtSecret =
    process.env.APP_PDF_JWT_KEY ||
    process.env.APP_API_JWT_KEY ||
    process.env.APP_JWT_KEY ||
    "";

  if (!jwtSecret) {
    return null;
  }

  return jwt.sign(
    {
      user_id: Number(user.user_id || 0),
      email: user.email || user.username || "painel@tratorbr.com",
    },
    jwtSecret,
    { expiresIn: "10m" }
  );
}

module.exports = {
  buildEvaluationModuleFilter,
  buildEvaluationVisibilityFilter,
  getAppPdfBaseUrls,
  getEvaluationDisplayId,
  getPdfRouteByEvaluation,
  isCheckBrEvaluation,
  normalizeEvaluationModule,
  signAppPdfToken,
};
