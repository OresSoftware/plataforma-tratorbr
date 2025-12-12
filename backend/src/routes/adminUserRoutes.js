const express = require('express');
const router = express.Router();
const adminUserController = require('../controllers/adminUserController');

// GET /api/admin/users/contador/ativos (deve vir ANTES de /:id)
router.get('/contador/ativos', adminUserController.contadorAtivos);

// GET /api/admin/users
router.get('/', adminUserController.listarUsuarios);

// GET /api/admin/users/:id
router.get('/:id', adminUserController.buscarUsuarioPorId);

// PUT /api/admin/users/:id
router.put('/:id', adminUserController.atualizarUsuario);

// PATCH /api/admin/users/:id/status
router.patch('/:id/status', adminUserController.ativarDesativarUsuario);

// POST /api/admin/users/:id/reset-password
router.post('/:id/reset-password', adminUserController.resetarSenha);

// GET /api/admin/users/cities
router.get('/cities/listar', adminUserController.listarCidades);

module.exports = router;
