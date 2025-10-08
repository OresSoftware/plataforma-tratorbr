// backend/src/routes/adminEnterpriseRoutes.js
const express = require("express");
const {
  listarEmpresas,
  buscarEmpresaPorId,
  criarEmpresa,
  atualizarEmpresa,
  ativarDesativarEmpresa,
  contadorAtivos,
} = require("../controllers/adminEnterpriseController");

const router = express.Router();

// As rotas aqui já são protegidas pelo adminRoutes.js
// que aplica verificarAdmin antes de chegar aqui.

// GET /api/admin/enterprises/contador/ativos
// IMPORTANTE: Esta rota deve vir ANTES de /:id para não conflitar
router.get("/contador/ativos", contadorAtivos);

// GET /api/admin/enterprises?status=ativos&page=1&pageSize=20&busca=termo
router.get("/", listarEmpresas);

// GET /api/admin/enterprises/:id
router.get("/:id", buscarEmpresaPorId);

// POST /api/admin/enterprises
router.post("/", criarEmpresa);

// PUT /api/admin/enterprises/:id
router.put("/:id", atualizarEmpresa);

// PATCH /api/admin/enterprises/:id/status
router.patch("/:id/status", ativarDesativarEmpresa);

module.exports = router;