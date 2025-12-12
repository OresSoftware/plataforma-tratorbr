const express = require('express');
const jwt = require('jsonwebtoken');
const adminController = require('../controllers/adminController');
const adminAuthController = require('../controllers/adminAuthController');
const adminContatoRoutes = require('./adminContatoRoutes');
const adminEnterpriseRoutes = require('./adminEnterpriseRoutes'); 
const cityController = require('../controllers/cityController');
const adminUserRoutes = require('./adminUserRoutes');
const adminLogoRoutes = require('./adminLogoRoutes');


const router = express.Router();

// Middlewares de segurança //
const verificarAdmin = async (req, res, next) => {
  try {
    const token = (req.headers.authorization || '').split(' ')[1];
    if (!token) return res.status(401).json({ code: 'NO_AUTH', message: 'Não autenticado' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ code: 'NO_AUTH', message: 'Token inválido' });
    }

    req.admin = {
      id: payload.id,
      username: payload.username,
      role: payload.role || 'gestor'
    };

    next();
  } catch (err) {
    console.error('verificarAdmin:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Erro interno de autenticação.' });
  }
};

const exigirMaster = (req, res, next) => {
  if (req.admin?.role !== 'master') {
    return res.status(403).json({ message: 'Acesso restrito a administradores master.' });
  }
  next();
};

// Rotas públicas de Admin //
router.post('/login', adminAuthController.loginAdmin);
router.get('/verificar-token', adminAuthController.verificarToken);
router.get('/ping', verificarAdmin, (req, res) => res.json({ ok: true, adminId: req.admin.id }));

// ------------------ Rotas protegidas ------------------ //
router.get('/dashboard/metricas', verificarAdmin, adminController.obterMetricasDashboard);
router.get('/dashboard/pendencias', verificarAdmin, adminController.obterPendencias);
router.use('/contatos', verificarAdmin, adminContatoRoutes);
router.use('/enterprises', verificarAdmin, adminEnterpriseRoutes); 
router.get('/cities', verificarAdmin, cityController.listarCidades);
router.get('/cargos', verificarAdmin, cityController.listarCargos);
router.get('/ocupacoes', verificarAdmin, cityController.listarOcupacoes);
router.use('/users', verificarAdmin, adminUserRoutes);
router.use('/', verificarAdmin, adminLogoRoutes); 


module.exports = router;
