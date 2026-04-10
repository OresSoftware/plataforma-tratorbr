const express = require("express");
const adminEvaluationController = require("../controllers/adminEvaluationController");

const router = express.Router();

router.get("/tabelabr/filters", adminEvaluationController.listarTabelaBrFiltros);
router.get("/tabelabr", adminEvaluationController.listarTabelaBr);
router.get("/checkbr/filters", adminEvaluationController.listarCheckBrFiltros);
router.get("/checkbr", adminEvaluationController.listarCheckBr);
router.get("/:userId/:avaliadorId/pdf", adminEvaluationController.baixarPdfAvaliacao);
router.get("/:userId/:avaliadorId", adminEvaluationController.buscarAvaliacaoPorId);

module.exports = router;
