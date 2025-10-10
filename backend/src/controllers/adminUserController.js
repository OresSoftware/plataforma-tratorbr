// backend/src/controllers/adminUserController.js
const pool = require("../config/db");
const bcrypt = require('bcrypt');

// Função auxiliar para remover caracteres não numéricos
const soNumeros = (str) => String(str || '').replace(/\D/g, '');

// GET /api/admin/users
async function listarUsuarios(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const pageSize = Math.min(100, Math.max(5, parseInt(req.query.pageSize || "20", 10)));
    const offset = (page - 1) * pageSize;
    const status = req.query.status || 'todos';
    const busca = req.query.busca || '';

    let whereClauses = ['1=1'];
    const params = [];

    // Filtro por status
    if (status === 'ativos') {
      whereClauses.push('u.status = 1');
    } else if (status === 'inativos') {
      whereClauses.push('u.status = 0');
    }

    // Filtro de busca (nome, sobrenome, email ou CPF)
    if (busca.trim()) {
      const cpfLimpo = soNumeros(busca);
      whereClauses.push(`(
        u.firstname LIKE ? OR 
        u.lastname LIKE ? OR 
        u.email LIKE ? OR
        REPLACE(REPLACE(u.cpf, '.', ''), '-', '') LIKE ?
      )`);
      const buscaParam = `%${busca}%`;
      const cpfParam = `%${cpfLimpo}%`;
      params.push(buscaParam, buscaParam, buscaParam, cpfParam);
    }

    const whereSql = whereClauses.join(' AND ');

    // Buscar usuários com informações relacionadas
    const [rows] = await pool.query(
      `SELECT 
        u.*,
        e.fantasia as empresa_nome,
        c.name as cargo_nome,
        o.name as ocupacao_nome,
        ci.name as cidade_nome,
        ci.code as cidade_uf
       FROM ocbr_user u
       LEFT JOIN ocbr_enterprise e ON u.enterprise_id = e.enterprise_id
       LEFT JOIN ocbr_cargo c ON u.cargo_id = c.cargo_id
       LEFT JOIN ocbr_ocupacao o ON u.ocupacao_id = o.ocupacao_id
       LEFT JOIN ocbr_city ci ON u.city_id = ci.city_id
      WHERE ${whereSql}
      ORDER BY u.firstname ASC
      LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    // Contar total de registros
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total 
       FROM ocbr_user u
      WHERE ${whereSql}`,
      params
    );

    res.json({ ok: true, data: rows, page, pageSize, total });
  } catch (e) {
    console.error("listarUsuarios:", e);
    res.status(500).json({ ok: false, error: "Erro ao listar usuários." });
  }
}

// GET /api/admin/users/:id
async function buscarUsuarioPorId(req, res) {
  try {
    const { id } = req.params;

    const [[user]] = await pool.query(
      `SELECT 
        u.*,
        e.fantasia as empresa_nome,
        c.name as cargo_nome,
        o.name as ocupacao_nome,
        ci.name as cidade_nome,
        ci.code as cidade_uf
       FROM ocbr_user u
       LEFT JOIN ocbr_enterprise e ON u.enterprise_id = e.enterprise_id
       LEFT JOIN ocbr_cargo c ON u.cargo_id = c.cargo_id
       LEFT JOIN ocbr_ocupacao o ON u.ocupacao_id = o.ocupacao_id
       LEFT JOIN ocbr_city ci ON u.city_id = ci.city_id
      WHERE u.user_id = ?`,
      [id]
    );

    if (!user) {
      return res.status(404).json({ ok: false, error: 'Usuário não encontrado.' });
    }

    // Não retornar senha
    delete user.password;
    delete user.salt;
    delete user.tmp_password;

    res.json({ ok: true, data: user });
  } catch (e) {
    console.error("buscarUsuarioPorId:", e);
    res.status(500).json({ ok: false, error: "Erro ao buscar usuário." });
  }
}

// PUT /api/admin/users/:id
async function atualizarUsuario(req, res) {
  try {
    const { id } = req.params;
    const payload = req.body;

    // Remover campos que não devem ser atualizados diretamente
    delete payload.user_id;
    delete payload.password;
    delete payload.salt;
    delete payload.tmp_password;
    delete payload.empresa_nome;
    delete payload.cargo_nome;
    delete payload.ocupacao_nome;
    delete payload.cidade_nome;
    delete payload.cidade_uf;
    delete payload.date_added;
    delete payload.plano_valido;
    delete payload.device_id;
    delete payload.api_token;
    delete payload.code;
    delete payload.ip;
    delete payload.tmp_limite;
    delete payload.tmp_device;
    delete payload.user_group_id;
    delete payload.username;
    delete payload.image;
    delete payload.plano_id;
    delete payload.sequencial;
    
    // Atualizar date_modified
    payload.date_modified = new Date();

    // Validar email único (exceto o próprio registro)
    if (payload.email) {
      const [[existing]] = await pool.query(
        'SELECT user_id FROM ocbr_user WHERE email = ? AND user_id != ?',
        [payload.email, id]
      );
      if (existing) {
        return res.status(400).json({ ok: false, error: 'Email já cadastrado para outro usuário.' });
      }
    }

    await pool.query('UPDATE ocbr_user SET ? WHERE user_id = ?', [payload, id]);

    res.json({ ok: true, message: 'Usuário atualizado com sucesso!' });
  } catch (e) {
    console.error("atualizarUsuario:", e);
    res.status(500).json({ ok: false, error: "Erro ao atualizar usuário." });
  }
}


// PATCH /api/admin/users/:id/status
async function ativarDesativarUsuario(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (typeof status !== 'number' || (status !== 0 && status !== 1)) {
      return res.status(400).json({ ok: false, error: "Status inválido. Use 0 ou 1." });
    }

    const [[user]] = await pool.query(
      'SELECT user_id, firstname, lastname FROM ocbr_user WHERE user_id = ?',
      [id]
    );

    if (!user) {
      return res.status(404).json({ ok: false, error: 'Usuário não encontrado.' });
    }

    await pool.query(
      'UPDATE ocbr_user SET status = ?, date_modified = ? WHERE user_id = ?', 
      [status, new Date(), id]
    );

    const statusTexto = status ? 'ativado' : 'desativado';
    res.json({ 
      ok: true, 
      message: `Usuário ${user.firstname} ${user.lastname} ${statusTexto} com sucesso!` 
    });
  } catch (e) {
    console.error("ativarDesativarUsuario:", e);
    res.status(500).json({ ok: false, error: "Erro ao alterar status do usuário." });
  }
}

// POST /api/admin/users/:id/reset-password
async function resetarSenha(req, res) {
  try {
    const { id } = req.params;

    const [[user]] = await pool.query(
      'SELECT user_id, firstname, lastname, email FROM ocbr_user WHERE user_id = ?',
      [id]
    );

    if (!user) {
      return res.status(404).json({ ok: false, error: 'Usuário não encontrado.' });
    }

    // Gerar senha temporária (6 dígitos)
    const novaSenha = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash(novaSenha, 10);
    
    // Definir limite de 24 horas para usar a senha temporária
    const tmpLimite = new Date();
    tmpLimite.setHours(tmpLimite.getHours() + 24);

    await pool.query(
      'UPDATE ocbr_user SET tmp_password = ?, tmp_limite = ?, date_modified = ? WHERE user_id = ?',
      [hashedPassword, tmpLimite, new Date(), id]
    );

    // TODO: Aqui você pode enviar um email para o usuário com a nova senha
    // Por enquanto, vamos retornar a senha na resposta (apenas para admin)

    res.json({ 
      ok: true, 
      message: `Senha resetada com sucesso! Nova senha: ${novaSenha}`,
      novaSenha: novaSenha,
      email: user.email
    });
  } catch (e) {
    console.error("resetarSenha:", e);
    res.status(500).json({ ok: false, error: "Erro ao resetar senha." });
  }
}

// GET /api/admin/users/contador/ativos
async function contadorAtivos(req, res) {
  try {
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM ocbr_user WHERE status = 1`
    );
    res.json({ ok: true, total });
  } catch (e) {
    console.error("contadorAtivos:", e);
    res.status(500).json({ ok: false, error: "Erro ao obter contador." });
  }
}

module.exports = {
  listarUsuarios,
  buscarUsuarioPorId,
  atualizarUsuario,
  ativarDesativarUsuario,
  resetarSenha,
  contadorAtivos,
};