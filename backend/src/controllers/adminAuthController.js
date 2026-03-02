const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');

exports.loginAdmin = async (req, res) => {
  try {
    const { username, password, otp } = req.body;

    if (!username || !password || !otp) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    const [admins] = await db.query(
      `SELECT id, username, nome, sobrenome,password_hash AS senha_hash, role, ativo, twofa_secret
       FROM admins
       WHERE username = ? AND ativo = 1`,
      [username]
    );

    if (!admins.length) {
      console.log(`Usuário não encontrado: ${username}`);
      return res.status(401).json({ message: 'Usuário ou senha incorretos' });
    }

    const admin = admins[0];

    if (admin.ativo === 0) {
      console.log(`Tentativa de login com conta inativa: ${username}`);
      return res.status(403).json({
        code: 'ACCOUNT_NOT_ACTIVATED',
        message: 'Sua conta ainda não foi ativada. Verifique seu email para o link de ativação.',
        requiresActivation: true
      });
    }

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

    await db.query(
      `UPDATE admins SET ultimo_login = NOW() WHERE id = ?`,
      [admin.id]
    );

    console.log(`Login bem-sucedido: ${username}`);

    let permissoes = [];
    if (admin.role === 'funcionario') {
      const [perms] = await db.query(
        `SELECT sp.page_key 
         FROM user_permissions up
         JOIN system_pages sp ON up.page_id = sp.id
         WHERE up.user_id = ?`,
        [admin.id]
      );
      permissoes = perms.map(p => p.page_key);
    }

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
        nome: admin.nome,
        sobrenome: admin.sobrenome,
        role: admin.role,
        permissoes
      }
    });

  } catch (e) {
    console.error('Erro no login admin:', e);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

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

    let permissoes = [];
    if (decoded.role === 'funcionario') {
      const [perms] = await db.query(
        `SELECT sp.page_key FROM user_permissions up JOIN system_pages sp ON up.page_id = sp.id WHERE up.user_id = ?`,
        [decoded.id]
      );
      permissoes = perms.map(p => p.page_key);
    }

    res.json({
      valid: true,
      admin: {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role,
        permissoes
      }
    });

  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};