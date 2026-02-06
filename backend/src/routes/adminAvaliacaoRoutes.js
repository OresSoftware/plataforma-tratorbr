const express = require("express");
const avaliacaoController = require("../controllers/avaliacaoController");

const router = express.Router();

router.get("/contador/ativas", avaliacaoController.contadorAvaliacoesAtivas);

router.get("/", avaliacaoController.listarAvaliacoesAdmin);

router.patch("/:id/status", avaliacaoController.atualizarStatusAvaliacao);

router.delete("/:id", avaliacaoController.deletarAvaliacao);

module.exports = router;
