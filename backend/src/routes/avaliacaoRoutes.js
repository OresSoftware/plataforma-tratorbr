const express = require("express");
const avaliacaoController = require("../controllers/avaliacaoController");

const router = express.Router();

router.post("/", avaliacaoController.criarAvaliacao);

router.get("/", avaliacaoController.listarAvaliacoes);

router.get("/stats", avaliacaoController.obterEstatisticas);

module.exports = router;
