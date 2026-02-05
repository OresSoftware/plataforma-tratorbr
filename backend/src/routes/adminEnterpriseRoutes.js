const express = require("express");
const {
  listarEmpresas,
  buscarEmpresaPorId,
  criarEmpresa,
  atualizarEmpresa,
  ativarDesativarEmpresa,
  contadorAtivos,
  listarUsuariosDaEmpresa,
  obterEnderecoCobranca,
  salvarEnderecoCobranca,
  removerEnderecoCobranca,
  listarMatrizesAtivas,
  listarFiliaisDaMatriz,
} = require("../controllers/adminEnterpriseController");

const router = express.Router();

router.get("/contador/ativos", contadorAtivos);

router.get("/matrizes", listarMatrizesAtivas);

router.get("/:id/users", listarUsuariosDaEmpresa);

router.get("/:id/filiais", listarFiliaisDaMatriz);

router.get("/:id/cobranca", obterEnderecoCobranca);
router.put("/:id/cobranca", salvarEnderecoCobranca);
router.delete("/:id/cobranca", removerEnderecoCobranca);

router.get("/", listarEmpresas);

router.get("/:id", buscarEmpresaPorId);

router.post("/", criarEmpresa);

router.put("/:id", atualizarEmpresa);

router.patch("/:id/status", ativarDesativarEmpresa);

module.exports = router;
