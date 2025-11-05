// backend/src/routes/adminEnterpriseRoutes.js
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

const router = express.Router();

// Contador de empresas ativas
router.get("/contador/ativos", contadorAtivos);

// --- Rotas específicas DEVEM vir antes de "/:id" para não serem ofuscadas --- //

// NOVO: Autocomplete de Matrizes ativas (para o formulário de Filial)
// Ex.: GET /api/admin/enterprises/matrizes?search=acme
router.get("/matrizes", listarMatrizesAtivas);

// Listar usuários vinculados à empresa
router.get("/:id/users", listarUsuariosDaEmpresa);

// Listar filiais de uma Matriz
router.get("/:id/filiais", listarFiliaisDaMatriz);

// Endereço de cobrança (ocbr_enterprise_cobranca)
router.get("/:id/cobranca", obterEnderecoCobranca);     // ler
router.put("/:id/cobranca", salvarEnderecoCobranca);     // criar/atualizar (upsert)
router.delete("/:id/cobranca", removerEnderecoCobranca); // remover

// Listar empresas (com filtros, paginação e busca)
router.get("/", listarEmpresas);

// Buscar uma empresa específica
router.get("/:id", buscarEmpresaPorId);

// Criar nova empresa
router.post("/", criarEmpresa);

// Atualizar dados da empresa
router.put("/:id", atualizarEmpresa);

// Ativar / Desativar empresa
router.patch("/:id/status", ativarDesativarEmpresa);

module.exports = router;
