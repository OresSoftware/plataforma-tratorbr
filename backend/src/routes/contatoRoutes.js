const express = require("express");
const { criarContato } = require("../controllers/contatoController");
const { contatoLimiter } = require("../../middleware/rateLimiter");

const router = express.Router();
router.post("/", contatoLimiter, criarContato);

module.exports = router;
