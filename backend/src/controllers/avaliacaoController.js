const pool = require("../config/db");

function validarAvaliacao(dados) {
  const erros = {};

  if (!dados.nome || typeof dados.nome !== "string") {
    erros.nome = "Nome é obrigatório";
  } else if (dados.nome.trim().length < 3) {
    erros.nome = "Nome deve ter no mínimo 3 caracteres";
  } else if (dados.nome.trim().length > 255) {
    erros.nome = "Nome não pode exceder 255 caracteres";
  }

  if (!dados.mensagem || typeof dados.mensagem !== "string") {
    erros.mensagem = "Mensagem é obrigatória";
  } else if (dados.mensagem.trim().length < 10) {
    erros.mensagem = "Mensagem deve ter no mínimo 10 caracteres";
  } else if (dados.mensagem.trim().length > 5000) {
    erros.mensagem = "Mensagem não pode exceder 5000 caracteres";
  }

  const estrelas = parseInt(dados.estrelas, 10);
  if (isNaN(estrelas) || estrelas < 1 || estrelas > 5) {
    erros.estrelas = "Classificação deve ser entre 1 e 5 estrelas";
  }

  return erros;
}

async function criarAvaliacao(req, res) {
  try {
    const { nome, mensagem, estrelas } = req.body || {};

    const erros = validarAvaliacao({ nome, mensagem, estrelas });
    if (Object.keys(erros).length > 0) {
      return res.status(400).json({ ok: false, erros });
    }

    const [result] = await pool.query(
      `INSERT INTO avaliacoes (nome, mensagem, estrelas, ativo)
       VALUES (?, ?, ?, 1)`,
      [nome.trim(), mensagem.trim(), parseInt(estrelas, 10)]
    );

    return res.status(201).json({
      ok: true,
      id: result.insertId,
      mensagem: "Avaliação enviada com sucesso!",
    });
  } catch (err) {
    console.error("criarAvaliacao:", err);
    return res.status(500).json({
      ok: false,
      erro: "Erro ao salvar avaliação.",
    });
  }
}

async function listarAvaliacoes(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const pageSize = Math.min(50, Math.max(5, parseInt(req.query.pageSize || "10", 10)));
    const offset = (page - 1) * pageSize;

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM avaliacoes WHERE ativo = 1`
    );

    const [avaliacoes] = await pool.query(
      `SELECT id, nome, mensagem, estrelas, data_criacao
       FROM avaliacoes
       WHERE ativo = 1
       ORDER BY data_criacao DESC
       LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );

    return res.json({
      ok: true,
      data: avaliacoes,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error("listarAvaliacoes:", err);
    return res.status(500).json({
      ok: false,
      erro: "Erro ao listar avaliações.",
    });
  }
}

async function obterEstatisticas(req, res) {
  try {

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM avaliacoes WHERE ativo = 1`
    );

    const [[{ media }]] = await pool.query(
      `SELECT AVG(estrelas) AS media FROM avaliacoes WHERE ativo = 1`
    );

    const [distribuicao] = await pool.query(
      `SELECT estrelas, COUNT(*) AS quantidade
       FROM avaliacoes
       WHERE ativo = 1
       GROUP BY estrelas
       ORDER BY estrelas DESC`
    );

    const dist = {};
    for (let i = 1; i <= 5; i++) {
      dist[i] = 0;
    }
    distribuicao.forEach((row) => {
      dist[row.estrelas] = row.quantidade;
    });

    return res.json({
      ok: true,
      total,
      media: media ? parseFloat(media).toFixed(1) : 0,
      distribuicao: dist,
    });
  } catch (err) {
    console.error("obterEstatisticas:", err);
    return res.status(500).json({
      ok: false,
      erro: "Erro ao obter estatísticas.",
    });
  }
}

async function listarAvaliacoesAdmin(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const pageSize = Math.min(100, Math.max(5, parseInt(req.query.pageSize || "20", 10)));
    const offset = (page - 1) * pageSize;
    const status = String(req.query.status || "todos").toLowerCase();

    let where = "1=1";
    const params = [];

    if (status === "ativas") {
      where = "ativo = 1";
    } else if (status === "inativas") {
      where = "ativo = 0";
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM avaliacoes WHERE ${where}`,
      params
    );

    const [avaliacoes] = await pool.query(
      `SELECT id, nome, mensagem, estrelas, ativo, data_criacao, data_atualizacao
       FROM avaliacoes
       WHERE ${where}
       ORDER BY data_criacao DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    return res.json({
      ok: true,
      data: avaliacoes,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error("listarAvaliacoesAdmin:", err);
    return res.status(500).json({
      ok: false,
      erro: "Erro ao listar avaliações.",
    });
  }
}

async function atualizarStatusAvaliacao(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const { ativo } = req.body || {};

    if (!id || typeof ativo !== "boolean") {
      return res.status(400).json({
        ok: false,
        erro: "ID e status (ativo) são obrigatórios",
      });
    }

    const [result] = await pool.query(
      `UPDATE avaliacoes SET ativo = ? WHERE id = ?`,
      [ativo ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        erro: "Avaliação não encontrada",
      });
    }

    return res.json({
      ok: true,
      mensagem: `Avaliação ${ativo ? "ativada" : "desativada"} com sucesso`,
    });
  } catch (err) {
    console.error("atualizarStatusAvaliacao:", err);
    return res.status(500).json({
      ok: false,
      erro: "Erro ao atualizar avaliação",
    });
  }
}

async function deletarAvaliacao(req, res) {
  try {
    const id = parseInt(req.params.id, 10);

    if (!id) {
      return res.status(400).json({
        ok: false,
        erro: "ID é obrigatório",
      });
    }

    const [result] = await pool.query(
      `DELETE FROM avaliacoes WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        erro: "Avaliação não encontrada",
      });
    }

    return res.json({
      ok: true,
      mensagem: "Avaliação deletada com sucesso",
    });
  } catch (err) {
    console.error("deletarAvaliacao:", err);
    return res.status(500).json({
      ok: false,
      erro: "Erro ao deletar avaliação",
    });
  }
}

async function contadorAvaliacoesAtivas(req, res) {
  try {
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM avaliacoes WHERE ativo = 1`
    );

    return res.json({
      ok: true,
      total,
    });
  } catch (err) {
    console.error("contadorAvaliacoesAtivas:", err);
    return res.status(500).json({
      ok: false,
      erro: "Erro ao contar avaliações",
    });
  }
}

module.exports = {
  criarAvaliacao,
  listarAvaliacoes,
  obterEstatisticas,
  listarAvaliacoesAdmin,
  atualizarStatusAvaliacao,
  deletarAvaliacao,
  contadorAvaliacoesAtivas,
};
