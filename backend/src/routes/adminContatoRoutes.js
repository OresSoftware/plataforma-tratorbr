const express = require("express");
const {
  listarContatos,
  marcarRespondido,
  excluirContato,
  contadorPendentes,
} = require("../controllers/adminContatoController");

const router = express.Router();

router.get("/", listarContatos);

router.get("/contador", contadorPendentes);

router.patch("/:id/respondido", marcarRespondido);

router.delete("/:id", excluirContato);

module.exports = router;
