// middleware/verificarMaster.js
const verificarMaster = (req, res, next) => {
  try {
    // Verifica se o admin está autenticado
    if (!req.admin) {
      return res.status(401).json({ 
        message: 'Acesso negado. Faça login como administrador.',
        forceLogout: true 
      });
    }

    // Verifica se o admin tem role master
    if (req.admin.role !== 'master') {
      return res.status(403).json({ 
        message: 'Acesso negado. Apenas administradores master podem acessar esta funcionalidade.',
        requireMaster: true 
      });
    }

    next();
  } catch (e) {
    console.error('Erro ao verificar permissão master:', e);
    return res.status(500).json({ 
      message: 'Erro interno do servidor.' 
    });
  }
};

module.exports = verificarMaster;

