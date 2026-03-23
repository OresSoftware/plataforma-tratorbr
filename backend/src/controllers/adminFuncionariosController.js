const pool = require("../config/db");
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

async function criarFuncionario(req, res) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { nome, sobrenome, email, username, senha, role, permissoes } = req.body;

    if (!nome || !sobrenome || !email || !username || !senha || !role) {
      return res.status(400).json({
        code: "VALIDATION_ERROR",
        message: "Todos os campos (nome, sobrenome, email, username, senha, role) são obrigatórios.",
      });
    }

    if (!["master", "funcionario"].includes(role)) {
      return res.status(400).json({
        code: "INVALID_ROLE",
        message: "O 'role' deve ser 'master' ou 'funcionario'.",
      });
    }

    const [existing] = await connection.execute(
      "SELECT id FROM `admins` WHERE email = ? OR username = ?",
      [email, username]
    );

    if (existing.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        code: "DUPLICATE_ENTRY",
        message: "Email ou username já registrado no sistema.",
      });
    }

    const passwordHash = await bcrypt.hash(senha, 10);
    const secret = speakeasy.generateSecret({ name: `TratorBR (${username})` });

    const [result] = await connection.execute(
      `INSERT INTO \`admins\` (nome, sobrenome, email, username, password_hash, role, twofa_secret, two_fa_enabled, ativo)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1)`,
      [nome, sobrenome, email, username, passwordHash, role, secret.base32]
    );

    const funcionarioId = result.insertId;

    if (role === "funcionario" && Array.isArray(permissoes) && permissoes.length > 0) {
      const permissionValues = permissoes.map(pageId => [funcionarioId, pageId]);
      await connection.query(
        "INSERT INTO `user_permissions` (user_id, page_id) VALUES ?",
        [permissionValues]
      );
    }

    const qrCodeDataURL = await qrcode.toDataURL(secret.otpauth_url);

    await connection.commit();

    return res.status(201).json({
      code: "FUNCIONARIO_CREATED",
      message: "Funcionário criado com sucesso!",
      data: {
        id: funcionarioId,
        nome,
        sobrenome,
        email,
        username,
        role,
        qrCode: qrCodeDataURL,
        secret: secret.base32,
      },
    });

  } catch (error) {
    await connection.rollback();
    console.error("Erro ao criar funcionário:", error);
    return res.status(500).json({
      code: "SERVER_ERROR",
      message: "Ocorreu um erro inesperado no servidor ao criar o funcionário.",
    });
  } finally {
    connection.release();
  }
}

async function listarFuncionarios(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const pageSize = Math.min(100, Math.max(5, parseInt(req.query.pageSize || "20", 10)));
    const offset = (page - 1) * pageSize;

    const busca = (req.query.busca || "").trim();
    const funcao = (req.query.funcao || "").trim().toLowerCase();

    let whereConditions = [];
    let queryParams = [];

    if (busca) {
      whereConditions.push(
        "(nome LIKE ? OR sobrenome LIKE ? OR username LIKE ? OR email LIKE ?)"
      );
      const searchTerm = `%${busca}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (funcao && ["master", "funcionario"].includes(funcao)) {
      whereConditions.push("role = ?");
      queryParams.push(funcao);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

    const [funcionarios] = await pool.query(
      `SELECT id, nome, sobrenome, email, username, role, ativo, created_at 
       FROM \`admins\` 
       ${whereClause}
       ORDER BY nome ASC
       LIMIT ? OFFSET ?`,
      [...queryParams, pageSize, offset]
    );

    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) as total FROM \`admins\` ${whereClause}`,
      queryParams
    );

    return res.json({
      code: "FUNCIONARIOS_LISTED",
      data: funcionarios,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Erro ao listar funcionários:", error);
    return res.status(500).json({
      code: "SERVER_ERROR",
      message: "Erro ao listar funcionários.",
    });
  }
}

async function obterFuncionario(req, res) {
  try {
    const { id } = req.params;

    const [funcionarios] = await pool.execute(
      `SELECT id, nome, sobrenome, username, email, role, twofa_secret, created_at, ultimo_login FROM \`admins\` WHERE id = ?`,
      [id]
    );

    if (funcionarios.length === 0) {
      return res.status(404).json({
        code: "NOT_FOUND",
        message: "Funcionário não encontrado.",
      });
    }

    const funcionario = funcionarios[0];

    if (funcionario.role === "funcionario") {
      const [permissoes] = await pool.execute(
        `SELECT sp.id, sp.page_key, sp.nome 
         FROM \`user_permissions\` up
         JOIN \`system_pages\` sp ON up.page_id = sp.id
         WHERE up.user_id = ?`,
        [funcionario.id]
      );
      funcionario.permissoes = permissoes;
    } else {
      funcionario.permissoes = [];
    }

    return res.json({
      code: "FUNCIONARIO_FOUND",
      data: funcionario,
    });
  } catch (error) {
    console.error("Erro ao obter funcionário:", error);
    return res.status(500).json({
      code: "SERVER_ERROR",
      message: "Erro ao obter funcionário.",
    });
  }
}

async function atualizarFuncionario(req, res) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const { id } = req.params;
    const { nome, sobrenome, email, username, role, permissoes, ativo } = req.body;

    const [funcionarios] = await connection.execute("SELECT id, role, email, username FROM `admins` WHERE id = ?", [id]);
    if (funcionarios.length === 0) {
      return res.status(404).json({ code: "NOT_FOUND", message: "Funcionário não encontrado." });
    }

    const funcionarioAtual = funcionarios[0];

    if (email && email !== funcionarioAtual.email) {
      const [existingEmail] = await connection.execute(
        "SELECT id FROM `admins` WHERE email = ? AND id != ?",
        [email, id]
      );
      if (existingEmail.length > 0) {
        await connection.rollback();
        return res.status(409).json({
          code: "DUPLICATE_EMAIL",
          message: "Este email já está registrado no sistema.",
        });
      }
    }

    if (username && username !== funcionarioAtual.username) {
      const [existingUsername] = await connection.execute(
        "SELECT id FROM `admins` WHERE username = ? AND id != ?",
        [username, id]
      );
      if (existingUsername.length > 0) {
        await connection.rollback();
        return res.status(409).json({
          code: "DUPLICATE_USERNAME",
          message: "Este username já está registrado no sistema.",
        });
      }
    }

    const updates = [];
    const values = [];

    if (nome) { updates.push("nome = ?"); values.push(nome); }
    if (sobrenome) { updates.push("sobrenome = ?"); values.push(sobrenome); }
    if (email) { updates.push("email = ?"); values.push(email); }
    if (username) { updates.push("username = ?"); values.push(username); }
    if (role && ["master", "funcionario"].includes(role)) { updates.push("role = ?"); values.push(role); }
    if (ativo !== undefined && [0, 1].includes(ativo)) { updates.push("ativo = ?"); values.push(ativo); }

    if (updates.length > 0) {
      values.push(id);
      await connection.execute(`UPDATE \`admins\` SET ${updates.join(", ")} WHERE id = ?`, values);
    }

    if (role === "funcionario" && Array.isArray(permissoes)) {
      await connection.execute("DELETE FROM `user_permissions` WHERE user_id = ?", [id]);
      if (permissoes.length > 0) {
        const permissionValues = permissoes.map(pageId => [id, pageId]);
        await connection.query("INSERT INTO `user_permissions` (user_id, page_id) VALUES ?", [permissionValues]);
      }
    } else if (role === "master") {
      await connection.execute("DELETE FROM `user_permissions` WHERE user_id = ?", [id]);
    }

    await connection.commit();
    return res.json({ code: "FUNCIONARIO_UPDATED", message: "Funcionário atualizado com sucesso." });

  } catch (error) {
    await connection.rollback();
    console.error("Erro ao atualizar funcionário:", error);
    return res.status(500).json({ code: "SERVER_ERROR", message: "Erro ao atualizar funcionário." });
  } finally {
    connection.release();
  }
}

async function deletarFuncionario(req, res) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const { id } = req.params;

    const [[admin]] = await connection.execute("SELECT id FROM `admins` WHERE id = ?", [id]);
    if (!admin) {
      return res.status(404).json({ code: "NOT_FOUND", message: "Funcionário não encontrado." });
    }

    await connection.execute("DELETE FROM `user_permissions` WHERE user_id = ?", [id]);
    await connection.execute("DELETE FROM `admins` WHERE id = ?", [id]);

    await connection.commit();

    return res.status(200).json({ code: "FUNCIONARIO_DELETED", message: "Funcionário deletado permanentemente com sucesso." });

  } catch (error) {
    await connection.rollback();
    console.error("Erro ao deletar funcionário:", error);
    return res.status(500).json({ code: "SERVER_ERROR", message: "Erro ao deletar funcionário." });
  } finally {
    connection.release();
  }
}

async function listarPaginas(req, res) {
  try {
    const [paginas] = await pool.execute(
      "SELECT id, page_key, nome FROM `system_pages` ORDER BY nome ASC"
    );
    return res.json({ code: "PAGES_LISTED", data: paginas });
  } catch (error) {
    console.error("Erro ao listar páginas:", error);
    return res.status(500).json({ code: "SERVER_ERROR", message: "Erro ao listar páginas." });
  }
}

module.exports = {
  criarFuncionario,
  listarFuncionarios,
  obterFuncionario,
  atualizarFuncionario,
  deletarFuncionario,
  listarPaginas,
};
