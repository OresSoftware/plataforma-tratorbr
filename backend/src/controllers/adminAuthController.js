const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');

// Login do administrador com verificação de IP
exports.loginAdmin = async (req, res) => {
  try {
    const { username, password, otp } = req.body;

    // Validação básica dos campos
    if (!username || !password || !otp) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    // Verificar se o usuário existe
    const [admins] = await db.query(
      `SELECT id, username, password_hash AS senha_hash, role, ativo, twofa_secret
   FROM admins
   WHERE username = ? AND ativo = 1`,
      [username]
    );

    if (!admins.length) {
      console.log(`Usuário não encontrado: ${username}`);
      return res.status(401).json({ message: 'Usuário ou senha incorretos' });
    }

    const admin = admins[0];

    // Verificar senha
    const ok = await bcrypt.compare(password, admin.senha_hash);
    if (!ok) {
      console.log(`Senha incorreta para usuário: ${username}`);
      return res.status(401).json({ message: 'Usuário ou senha incorretos' });
    }

    const validOtp = speakeasy.totp.verify({
      secret: admin.twofa_secret,
      encoding: 'base32',
      token: otp,
      step: 30,
      window: 1
    });

    if (!validOtp) {
      console.log(`Código 2FA inválido para usuário: ${username}`);
      return res.status(401).json({ message: 'Código 2FA inválido' });
    }

    // Atualizar ultimo_login
    await db.query(
      `UPDATE admins SET ultimo_login = NOW() WHERE id = ?`,
      [admin.id]
    );

    console.log(`Login bem-sucedido: ${username}`);

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role, tipo: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role
      }
    });

  } catch (e) {
    console.error('Erro no login admin:', e);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Verificar se o token é válido
exports.verificarToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.tipo !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    res.json({
      valid: true,
      admin: {
        id: decoded.id,
        username: decoded.username
      }
    });

  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};


