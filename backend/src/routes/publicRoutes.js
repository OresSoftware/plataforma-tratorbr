const express = require("express");
const router = express.Router();
const { proxyEsqueciSenha, proxyLoginUsuario, proxyRegistroUsuario, getOcupacoes } = require("../controllers/publicController");

router.post("/usuario/esqueci-senha", proxyEsqueciSenha);

router.post("/usuario/login", proxyLoginUsuario);

router.post("/usuario/cadastro", proxyRegistroUsuario);

router.get("/ocupacoes", getOcupacoes);

module.exports = router;