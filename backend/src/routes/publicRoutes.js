// backend/src/routes/publicRoutes.js
const express = require("express");
const router = express.Router();
const { proxyEsqueciSenha } = require("../controllers/publicController");

// POST /api/public/usuario/esqueci-senha
router.post("/usuario/esqueci-senha", proxyEsqueciSenha);

module.exports = router;
