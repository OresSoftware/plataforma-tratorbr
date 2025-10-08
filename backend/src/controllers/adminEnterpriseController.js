// backend/src/controllers/adminEnterpriseController.js
const pool = require("../config/db");

// Função auxiliar para remover caracteres não numéricos
const soNumeros = (str) => String(str || '').replace(/\D/g, '');

// GET /api/admin/enterprises
async function listarEmpresas(req, res) {
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
      whereClauses.push('e.ativo = 1');
    } else if (status === 'inativos') {
      whereClauses.push('e.ativo = 0');
    }

    // Filtro de busca (razão, fantasia, CNPJ ou cidade)
    if (busca.trim()) {
      const cnpjLimpo = soNumeros(busca);
      whereClauses.push(`(
        e.razao LIKE ? OR 
        e.fantasia LIKE ? OR 
        REPLACE(REPLACE(REPLACE(e.cnpj, '.', ''), '/', ''), '-', '') LIKE ? OR
        c.name LIKE ? OR
        c.code LIKE ?
      )`);
      const buscaParam = `%${busca}%`;
      const cnpjParam = `%${cnpjLimpo}%`;
      params.push(buscaParam, buscaParam, cnpjParam, buscaParam, buscaParam);
    }

    const whereSql = whereClauses.join(' AND ');

    // Buscar empresas com informações da cidade
    const [rows] = await pool.query(
      `SELECT e.*, c.name as cidade_nome, c.code as cidade_uf
         FROM ocbr_enterprise e
         LEFT JOIN ocbr_city c ON e.city_id = c.city_id
        WHERE ${whereSql}
        ORDER BY e.fantasia ASC
        LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    // Contar total de registros (COM JOIN)
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total 
         FROM ocbr_enterprise e
         LEFT JOIN ocbr_city c ON e.city_id = c.city_id
        WHERE ${whereSql}`,
      params
    );

    res.json({ ok: true, data: rows, page, pageSize, total });
  } catch (e) {
    console.error("listarEmpresas:", e);
    res.status(500).json({ ok: false, error: "Erro ao listar empresas." });
  }
}


// GET /api/admin/enterprises/:id
async function buscarEmpresaPorId(req, res) {
    try {
        const id = Number(req.params.id);
        if (!id) return res.status(400).json({ ok: false, error: "ID inválido." });

        const [rows] = await pool.query(
            `SELECT e.*, c.name as cidade_nome, c.code as cidade_uf
         FROM ocbr_enterprise e
         LEFT JOIN ocbr_city c ON e.city_id = c.city_id
        WHERE e.enterprise_id = ?`,
            [id]
        );

        if (!rows || rows.length === 0) {
            return res.status(404).json({ ok: false, error: "Empresa não encontrada." });
        }

        res.json({ ok: true, data: rows[0] });
    } catch (e) {
        console.error("buscarEmpresaPorId:", e);
        res.status(500).json({ ok: false, error: "Erro ao buscar empresa." });
    }
}

// POST /api/admin/enterprises
async function criarEmpresa(req, res) {
    try {
        const dados = req.body;

        if (!dados.fantasia || !dados.razao || !dados.cnpj) {
            return res.status(400).json({
                ok: false,
                error: 'Fantasia, Razão Social e CNPJ são obrigatórios.'
            });
        }

        const [[existente]] = await pool.query(
            'SELECT enterprise_id FROM ocbr_enterprise WHERE cnpj = ?',
            [dados.cnpj]
        );

        if (existente) {
            return res.status(400).json({
                ok: false,
                error: 'CNPJ já cadastrado no sistema.'
            });
        }

        const [result] = await pool.query(
            'INSERT INTO ocbr_enterprise SET ?',
            [dados]
        );

        res.status(201).json({
            ok: true,
            id: result.insertId,
            message: 'Empresa cadastrada com sucesso!'
        });
    } catch (e) {
        console.error("criarEmpresa:", e);
        res.status(500).json({ ok: false, error: "Erro ao criar empresa." });
    }
}

// PUT /api/admin/enterprises/:id
async function atualizarEmpresa(req, res) {
  try {
    const { id } = req.params;
    const payload = req.body;

    // Remover campos que não pertencem à tabela ocbr_enterprise
    delete payload.enterprise_id;
    delete payload.cidade_nome;
    delete payload.cidade_uf;
    delete payload.created_at;
    delete payload.updated_at;

    // Validar CNPJ único (exceto o próprio registro)
    if (payload.cnpj) {
      const cnpjLimpo = soNumeros(payload.cnpj);
      const [[existing]] = await pool.query(
        'SELECT enterprise_id FROM ocbr_enterprise WHERE REPLACE(REPLACE(REPLACE(cnpj, ".", ""), "/", ""), "-", "") = ? AND enterprise_id != ?',
        [cnpjLimpo, id]
      );
      if (existing) {
        return res.status(400).json({ ok: false, error: 'CNPJ já cadastrado para outra empresa.' });
      }
    }

    await pool.query('UPDATE ocbr_enterprise SET ? WHERE enterprise_id = ?', [payload, id]);

    res.json({ ok: true, message: 'Empresa atualizada com sucesso!' });
  } catch (e) {
    console.error("atualizarEmpresa:", e);
    res.status(500).json({ ok: false, error: "Erro ao atualizar empresa." });
  }
}


// PATCH /api/admin/enterprises/:id/status
async function ativarDesativarEmpresa(req, res) {
    try {
        const id = Number(req.params.id);
        const { ativo } = req.body;

        if (!id || typeof ativo !== 'number') {
            return res.status(400).json({ ok: false, error: "Dados inválidos." });
        }

        const [[empresa]] = await pool.query(
            'SELECT enterprise_id, fantasia FROM ocbr_enterprise WHERE enterprise_id = ?',
            [id]
        );

        if (!empresa) {
            return res.status(404).json({ ok: false, error: 'Empresa não encontrada.' });
        }

        await pool.query(
            'UPDATE ocbr_enterprise SET ativo = ? WHERE enterprise_id = ?',
            [ativo, id]
        );

        const statusTexto = ativo ? 'ativada' : 'desativada';
        res.json({
            ok: true,
            message: `Empresa ${empresa.fantasia} ${statusTexto} com sucesso!`
        });
    } catch (e) {
        console.error("ativarDesativarEmpresa:", e);
        res.status(500).json({ ok: false, error: "Erro ao alterar status da empresa." });
    }
}

// GET /api/admin/enterprises/contador/ativos
async function contadorAtivos(req, res) {
    try {
        const [[{ total }]] = await pool.query(
            `SELECT COUNT(*) AS total FROM ocbr_enterprise WHERE ativo = 1`
        );
        res.json({ ok: true, total });
    } catch (e) {
        console.error("contadorAtivos:", e);
        res.status(500).json({ ok: false, error: "Erro ao obter contador." });
    }
}

module.exports = {
    listarEmpresas,
    buscarEmpresaPorId,
    criarEmpresa,
    atualizarEmpresa,
    ativarDesativarEmpresa,
    contadorAtivos,
};
