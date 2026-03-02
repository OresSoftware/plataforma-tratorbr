const verificarAdmin = (req, res, next) => {
  try {
    // Verifica se o admin está autenticado
    if (!req.admin) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Acesso negado. Faça login como administrador.',
        forceLogout: true
      });
    }

    next();
  } catch (e) {
    console.error('Erro ao verificar autenticação de admin:', e);
    return res.status(500).json({
      code: 'SERVER_ERROR',
      message: 'Erro interno do servidor.'
    });
  }
};

module.exports = verificarAdmin;
