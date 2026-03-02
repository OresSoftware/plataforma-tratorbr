const express = require("express");
const router = express.Router();

const verificarAdmin = require("../../middleware/verificarAdmin");
const verificarMaster = require("../../middleware/verificarMaster");

const adminFuncionariosController = require("../controllers/adminFuncionariosController");

router.get(
  "/system-pages",
  verificarAdmin,
  verificarMaster,
  adminFuncionariosController.listarPaginas
);

router.post(
  "/",
  verificarAdmin,
  verificarMaster,
  adminFuncionariosController.criarFuncionario
);

router.get(
  "/",
  verificarAdmin,
  verificarMaster,
  adminFuncionariosController.listarFuncionarios
);

router.get(
  "/:id",
  verificarAdmin,
  verificarMaster,
  adminFuncionariosController.obterFuncionario
);

router.put(
  "/:id",
  verificarAdmin,
  verificarMaster,
  adminFuncionariosController.atualizarFuncionario
);

router.delete(
  "/:id",
  verificarAdmin,
  verificarMaster,
  adminFuncionariosController.deletarFuncionario
);

module.exports = router;
