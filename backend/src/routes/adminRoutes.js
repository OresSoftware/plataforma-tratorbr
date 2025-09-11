// backend/src/routes/adminRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const adminController = require('../controllers/adminController');
const adminAuthController = require('../controllers/adminAuthController');
const adminIpsController = require('../controllers/adminIpsController');
const adminContatoRoutes = require('./adminContatoRoutes');

const router = express.Router();

function getClientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  if (xf) return xf.split(',')[0].trim();
  const raw = req.ip || req.socket?.remoteAddress || req.connection?.remoteAddress || '';
  return String(raw).replace('::ffff:', '');
}

// -------- Middlewares de segurança -------- //
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

    const ip = getClientIp(req);
    const [rows] = await db.query(
      'SELECT id FROM admin_ips WHERE admin_id = ? AND ip = ? AND ativo = 1 LIMIT 1',
      [req.admin.id, ip]
    );
    const autorizado = Array.isArray(rows) && rows.length > 0;
    if (!autorizado) {
      return res.status(403).json({
        code: 'IP_NOT_ALLOWED',
        message: 'IP não autorizado para este administrador.'
      });
    }

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

// ------------------ Rotas públicas de Admin ------------------ //
router.post('/login', adminAuthController.loginAdmin);
router.get('/verificar-token', adminAuthController.verificarToken);
router.get('/ip-atual', adminAuthController.obterIpAtual || ((_req, res) => res.json({ ip: '-' })));
router.get('/ping', verificarAdmin, (req, res) => res.json({ ok: true, adminId: req.admin.id }));

// ------------------ Rotas protegidas ------------------ //
// Dashboard
router.get('/dashboard/metricas', verificarAdmin, adminController.obterMetricasDashboard);
router.get('/dashboard/pendencias', verificarAdmin, adminController.obterPendencias);

// ---- Gestão de IPs (Master) ---- //
router.get('/ips-autorizados', verificarAdmin, exigirMaster, adminIpsController.listarIpsAutorizados);
router.post('/ips-autorizados', verificarAdmin, exigirMaster, adminIpsController.adicionarIpAutorizado);
router.delete('/ips-autorizados/:id', verificarAdmin, exigirMaster, adminIpsController.removerIpAutorizado);
router.post('/ips-autorizados/:id/refresh-location', verificarAdmin, exigirMaster, adminIpsController.refreshIpLocation);

// ---- Rotas de Contatos ---- //
router.use('/contatos', adminContatoRoutes);

module.exports = router;

