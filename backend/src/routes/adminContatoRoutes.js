const express = require("express");
const {
  listarContatos,
  marcarRespondido,
  excluirContato,
  contadorPendentes,
} = require("../controllers/adminContatoController");

const router = express.Router();

// As rotas de contatos já são protegidas pelo adminRoutes.js
// que aplica verificarAdmin antes de chegar aqui.
// Aqui só precisamos verificar se é master.

const exigirMaster = (req, res, next) => {
  if (req.admin?.role !== 'master') {
    return res.status(403).json({ 
      message: 'Acesso restrito a administradores master.',
      requireMaster: true 
    });
  }
  next();
};

// Aplicar verificação de master em todas as rotas
router.use(exigirMaster);

// GET /api/admin/contatos?status=pendente&page=1&pageSize=20
router.get("/", listarContatos);

// GET /api/admin/contatos/contador
router.get("/contador", contadorPendentes);

// PATCH /api/admin/contatos/:id/respondido
router.patch("/:id/respondido", marcarRespondido);

// DELETE /api/admin/contatos/:id
router.delete("/:id", excluirContato);

module.exports = router;
