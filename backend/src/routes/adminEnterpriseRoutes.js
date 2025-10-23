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
} = require("../controllers/adminEnterpriseController");

const router = express.Router();

// Contador de empresas ativas
router.get("/contador/ativos", contadorAtivos);

// --- Rotas específicas DEVEM vir antes de "/:id" para não serem ofuscadas --- //

// Listar usuários vinculados à empresa
router.get("/:id/users", listarUsuariosDaEmpresa);

// Endereço de cobrança (ocbr_enterprise_cobranca)
router.get("/:id/cobranca", obterEnderecoCobranca);     // ler
router.put("/:id/cobranca", salvarEnderecoCobranca);     // criar/atualizar (upsert)
router.delete("/:id/cobranca", removerEnderecoCobranca); // remover

// --------------------------------------------------------------------------- //

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
