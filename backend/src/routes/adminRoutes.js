const express = require('express');
const jwt = require('jsonwebtoken');
const adminController = require('../controllers/adminController');
const adminEvaluationDashboardController = require('../controllers/adminEvaluationDashboardController');
const adminAuthController = require('../controllers/adminAuthController');
const adminContatoRoutes = require('./adminContatoRoutes');
const adminEnterpriseRoutes = require('./adminEnterpriseRoutes'); 
const cityController = require('../controllers/cityController');
const adminUserRoutes = require('./adminUserRoutes');
const adminLogoRoutes = require('./adminLogoRoutes');
const adminEvaluationRoutes = require('./adminEvaluationRoutes');
const { loginLimiter } = require('../../middleware/rateLimiter');
const {
  buildPanelSession,
  getAllowedPages,
  getPanelJwtSecret,
  getPanelUserById,
} = require("../services/panelAuthService");


const router = express.Router();

// Middlewares de segurança //
const verificarAdmin = async (req, res, next) => {
  try {
    const token = (req.headers.authorization || '').split(' ')[1];
    if (!token) return res.status(401).json({ code: 'NO_AUTH', message: 'Não autenticado' });

    let payload;
    try {
      payload = jwt.verify(token, getPanelJwtSecret());
    } catch {
      return res.status(401).json({ code: 'NO_AUTH', message: 'Token inválido' });
    }

    if (payload.tipo !== "panel" || !payload.user_id) {
      return res.status(401).json({ code: 'NO_AUTH', message: 'Token inválido' });
    }

    const user = await getPanelUserById(payload.user_id);
    if (!user || Number(user.status) !== 1) {
      return res.status(401).json({ code: 'NO_AUTH', message: 'Sessão inválida' });
    }

    req.admin = buildPanelSession(user);

    next();
  } catch (err) {
    console.error('verificarAdmin:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Erro interno de autenticação.' });
  }
};

const requireAllowedPage = (pageKey) => (req, res, next) => {
  const allowedPages = Array.isArray(req.admin?.allowedPages)
    ? req.admin.allowedPages
    : getAllowedPages(req.admin);

  if (allowedPages.includes(pageKey)) {
    return next();
  }

  return res.status(403).json({ code: 'FORBIDDEN', message: 'Acesso negado para este módulo.' });
};

const requireAnyAllowedPage = (pageKeys = []) => (req, res, next) => {
  const allowedPages = Array.isArray(req.admin?.allowedPages)
    ? req.admin.allowedPages
    : getAllowedPages(req.admin);

  if (pageKeys.some((pageKey) => allowedPages.includes(pageKey))) {
    return next();
  }

  return res.status(403).json({ code: 'FORBIDDEN', message: 'Acesso negado para este recurso.' });
};

// Rotas públicas de Admin //
router.post('/login', loginLimiter, adminAuthController.loginAdmin);
router.get('/verificar-token', adminAuthController.verificarToken);
router.get('/ping', verificarAdmin, (req, res) => res.json({ ok: true, adminId: req.admin.user_id }));

// ------------------ Rotas protegidas ------------------ //
router.get('/dashboard/metricas', verificarAdmin, requireAllowedPage('growth'), adminController.obterMetricasDashboard);
router.get('/dashboard/pendencias', verificarAdmin, requireAllowedPage('growth'), adminController.obterPendencias);
router.get('/dashboard/evaluations', verificarAdmin, requireAllowedPage('dashboard'), adminEvaluationDashboardController.obterDashboardAvaliacoes);
router.use('/contatos', verificarAdmin, requireAllowedPage('contatos'), adminContatoRoutes);
router.use('/enterprises', verificarAdmin, requireAllowedPage('empresas'), adminEnterpriseRoutes); 
router.get('/cities', verificarAdmin, requireAnyAllowedPage(['usuarios', 'empresas']), cityController.listarCidades);
router.get('/cargos', verificarAdmin, requireAllowedPage('usuarios'), cityController.listarCargos);
router.get('/ocupacoes', verificarAdmin, requireAllowedPage('usuarios'), cityController.listarOcupacoes);
router.use('/users', verificarAdmin, requireAllowedPage('usuarios'), adminUserRoutes);
router.use('/evaluations', verificarAdmin, requireAllowedPage('usuarios'), adminEvaluationRoutes);
router.use('/', verificarAdmin, requireAllowedPage('empresas'), adminLogoRoutes); 


module.exports = router;
