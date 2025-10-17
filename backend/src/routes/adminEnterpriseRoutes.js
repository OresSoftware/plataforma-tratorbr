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
} = require("../controllers/adminEnterpriseController");

const router = express.Router();

router.get("/contador/ativos", contadorAtivos);
router.get('/:id/users', listarUsuariosDaEmpresa);
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