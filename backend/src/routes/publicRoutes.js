const express = require("express");
const router = express.Router();
const { proxyEsqueciSenha, proxyLoginUsuario, proxyRegistroUsuario, getOcupacoes } = require("../controllers/publicController");

router.post("/usuario/esqueci-senha", proxyEsqueciSenha);

// POST /api/public/usuario/login
router.post("/usuario/login", proxyLoginUsuario);

// POST /api/public/usuario/cadastro
router.post("/usuario/cadastro", proxyRegistroUsuario);

// GET /api/public/ocupacoes
router.get("/ocupacoes", getOcupacoes);

module.exports = router;