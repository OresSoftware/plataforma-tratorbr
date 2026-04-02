const express = require('express');
const router = express.Router();
const authAppUser = require('../../middleware/authAppUser');
const { listarUsuariosDaMesmaEmpresa } = require('../controllers/gestaoUserController');

router.get('/usuarios', authAppUser, listarUsuariosDaMesmaEmpresa);

module.exports = router;
