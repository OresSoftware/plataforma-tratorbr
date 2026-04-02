const jwt = require('jsonwebtoken');

function authAppUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        ok: false,
        error: 'Token não informado.'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        ok: false,
        error: 'Token inválido.'
      });
    }

    const decoded = jwt.verify(token, process.env.APP_USER_JWT_SECRET);

    if (!decoded?.user_id) {
      return res.status(401).json({
        ok: false,
        error: 'Usuário inválido no token.'
      });
    }

    if (!decoded?.enterprise_id) {
      return res.status(403).json({
        ok: false,
        error: 'Usuário sem empresa vinculada.'
      });
    }

    req.appUser = decoded;

    return next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      error: 'Token expirado ou inválido.'
    });
  }
}

module.exports = authAppUser;
