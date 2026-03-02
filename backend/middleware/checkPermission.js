const jwt = require('jsonwebtoken');

/**
 * @param {string | string[]} requiredPermission
 */

function checkPermission(requiredPermission) {
  return (req, res, next) => {
    try {

      const user = req.admin;

      if (!user) {
        return res.status(401).json({ 
          code: 'NO_AUTH',
          message: "Não autenticado. Faça o login para continuar." 
        });
      }

      if (user.role === 'master') {
        return next(); 
      }

      if (user.role === 'funcionario') {
        const userPermissions = user.permissions || [];

        const requiredPermissionsArray = Array.isArray(requiredPermission) 
          ? requiredPermission 
          : [requiredPermission];

        const hasPermission = requiredPermissionsArray.some(p => userPermissions.includes(p));

        if (hasPermission) {
          return next(); 
        } else {
          return res.status(403).json({ 
            code: 'PERMISSION_DENIED',
            message: "Você não tem permissão para acessar este recurso." 
          });
        }
      }

      return res.status(403).json({ 
        code: 'INVALID_ROLE',
        message: "Acesso negado. Usuário inválido." 
      });
    } catch (err) {
      console.error('Erro ao verificar permissão:', err);
      return res.status(500).json({ 
        code: 'SERVER_ERROR',
        message: "Erro interno do servidor ao verificar permissão." 
      });
    }
  };
}

module.exports = checkPermission;
