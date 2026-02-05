const express = require("express");
const router = express.Router();
const { proxyEsqueciSenha } = require("../controllers/publicController");

router.post("/usuario/esqueci-senha", proxyEsqueciSenha);

module.exports = router;
