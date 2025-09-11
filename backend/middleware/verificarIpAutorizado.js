// middleware/verificarIpAutorizado.js
const db = require('../src/config/db');

// Middleware para verificar se o IP do admin ainda está autorizado
const verificarIpAutorizado = async (req, res, next) => {
  try {
    // Só aplicar para rotas de admin autenticadas
    if (!req.admin) {
      return next();
    }

    const clientIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                     req.socket?.remoteAddress || 
                     req.ip || 
                     req.connection?.remoteAddress;

    // Verificar se o IP atual ainda está autorizado para este admin
    const [rows] = await db.query(
      `SELECT id FROM admin_ips WHERE admin_id = ? AND ip = ? AND ativo = 1`,
      [req.admin.id, clientIP]
    );

    if (!rows.length) {
      console.log(`IP ${clientIP} não autorizado para admin ${req.admin.username}. Forçando logout.`);
      return res.status(403).json({ 
        message: 'IP não autorizado. Acesso revogado.',
        forceLogout: true 
      });
    }

    next();
  } catch (e) {
    console.error('Erro ao verificar IP autorizado:', e);
    // Em caso de erro, permite continuar para não quebrar o sistema
    next();
  }
};

module.exports = verificarIpAutorizado;

