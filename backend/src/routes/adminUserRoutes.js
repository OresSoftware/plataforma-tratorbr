const express = require('express');
const router = express.Router();
const adminUserController = require('../controllers/adminUserController');

router.get('/contador/ativos', adminUserController.contadorAtivos);

router.get('/', adminUserController.listarUsuarios);

router.get('/:id', adminUserController.buscarUsuarioPorId);

router.put('/:id', adminUserController.atualizarUsuario);

router.patch('/:id/status', adminUserController.ativarDesativarUsuario);

router.post('/:id/reset-password', adminUserController.resetarSenha);

router.get('/cities/listar', adminUserController.listarCidades);

module.exports = router;
