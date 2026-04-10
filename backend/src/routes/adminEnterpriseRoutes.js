const express = require("express");
const {
  listarEmpresas,
  buscarEmpresaPorId,
  criarEmpresa,
  atualizarEmpresa,
  ativarDesativarEmpresa,
  contadorAtivos,
  listarUsuariosDaEmpresa,
  obterEnderecoCobranca,
  salvarEnderecoCobranca,
  removerEnderecoCobranca,
  listarMatrizesAtivas,
  listarFiliaisDaMatriz,
} = require("../controllers/adminEnterpriseController");
const {
  canAccessEnterprises,
  canAccessEnterpriseId,
  isGlobalGroup,
  isStandardGroup,
} = require("../services/panelAuthService");

const router = express.Router();

const requireEnterpriseAccess = (req, res, next) => {
  if (!canAccessEnterprises(req.admin)) {
    return res.status(403).json({
      ok: false,
      error: "Seu usuário não possui acesso ao gerenciamento de empresas.",
    });
  }

  next();
};

const requireScopedEnterprise = async (req, res, next) => {
  if (isGlobalGroup(req.admin)) return next();

  const routeEnterpriseId = Number(req.params.id || 0);
  if (!routeEnterpriseId) return next();

  try {
    const allowed = await canAccessEnterpriseId(req.admin, routeEnterpriseId);
    if (allowed) return next();

    return res.status(403).json({
      ok: false,
      error: "Você só pode acessar empresas dentro do seu escopo permitido.",
    });
  } catch (error) {
    console.error("requireScopedEnterprise:", error);
    return res.status(500).json({
      ok: false,
      error: "Erro ao validar escopo da empresa.",
    });
  }
};

const blockScopedEnterpriseCreation = (req, res, next) => {
  if (!isGlobalGroup(req.admin)) {
    return res.status(403).json({
      ok: false,
      error: "Seu usuário não pode criar novas empresas pelo painel.",
    });
  }
  next();
};

const blockStandardEnterpriseWrite = (req, res, next) => {
  if (isStandardGroup(req.admin)) {
    return res.status(403).json({
      ok: false,
      error: "Seu usuário pode apenas visualizar a empresa vinculada.",
    });
  }

  next();
};

// Contador de empresas ativas
router.get("/contador/ativos", requireEnterpriseAccess, contadorAtivos);

// GET /api/admin/enterprises/matrizes?search=acme
router.get("/matrizes", requireEnterpriseAccess, listarMatrizesAtivas);

// Listar usuários vinculados à empresa
router.get("/:id/users", requireEnterpriseAccess, requireScopedEnterprise, listarUsuariosDaEmpresa);

// Listar filiais de uma Matriz
router.get("/:id/filiais", requireEnterpriseAccess, requireScopedEnterprise, listarFiliaisDaMatriz);

// Endereço de cobrança (ocbr_enterprise_cobranca)
router.get("/:id/cobranca", requireEnterpriseAccess, requireScopedEnterprise, obterEnderecoCobranca);
router.put("/:id/cobranca", requireEnterpriseAccess, requireScopedEnterprise, blockStandardEnterpriseWrite, salvarEnderecoCobranca);
router.delete("/:id/cobranca", requireEnterpriseAccess, requireScopedEnterprise, blockStandardEnterpriseWrite, removerEnderecoCobranca);

// Listar empresas (com filtros, paginação e busca)
router.get("/", requireEnterpriseAccess, listarEmpresas);

// Buscar uma empresa específica
router.get("/:id", requireEnterpriseAccess, requireScopedEnterprise, buscarEmpresaPorId);

// Criar nova empresa
router.post("/", requireEnterpriseAccess, blockScopedEnterpriseCreation, criarEmpresa);

// Atualizar dados da empresa
router.put("/:id", requireEnterpriseAccess, requireScopedEnterprise, blockStandardEnterpriseWrite, atualizarEmpresa);

// Ativar / Desativar empresa
router.patch("/:id/status", requireEnterpriseAccess, requireScopedEnterprise, blockStandardEnterpriseWrite, ativarDesativarEmpresa);

module.exports = router;
