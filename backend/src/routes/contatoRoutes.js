// backend/src/routes/contatoRoutes.js (CommonJS)
const express = require("express");
const { criarContato } = require("../controllers/contatoController");

const router = express.Router();
router.post("/", criarContato);

module.exports = router;
