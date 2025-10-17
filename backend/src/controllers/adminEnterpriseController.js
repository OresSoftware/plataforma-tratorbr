const pool = require("../config/db");

// Helpers
const soNumeros = (str) => String(str || '').replace(/\D/g, '');

// Validação de CNPJ (DV oficial)
const isCNPJ = (value = "") => {
  const cnpj = soNumeros(value);
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const calcDV = (base, pesos) => {
    const soma = base.split("").reduce((acc, d, i) => acc + Number(d) * pesos[i], 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const pesos1 = [5,4,3,2,9,8,7,6,5,4,3,2];
  const pesos2 = [6,5,4,3,2,9,8,7,6,5,4,3,2];

  const base12 = cnpj.slice(0, 12);
  const dv1 = calcDV(base12, pesos1);
  const dv2 = calcDV(base12 + String(dv1), pesos2);

  return cnpj.endsWith(String(dv1) + String(dv2));
};

/* =========================================================================
   Inscrição Estadual (IE) - Normalização e validação mínima (sem alterar DB)
   ========================================================================= */
const normalizeIE = (value = "") => String(value || "").trim();
const onlyDigits = (s = "") => String(s).replace(/\D/g, "");

function validarIEMinima(ieRaw = "") {
  const ie = normalizeIE(ieRaw);
  if (!ie) return true; // permitir vazio
  if (ie.toUpperCase() === "ISENTO") return true;
  const digits = onlyDigits(ie);
  // regra simples que você definiu: até 14 dígitos (bloqueios adicionais opcionais)
  if (digits.length < 1 || digits.length > 14) return false;
  return /^\d+$/.test(digits);
}

function prepararIEParaSalvar(ieRaw = "") {
  const ie = normalizeIE(ieRaw);
  if (!ie) return null;
  if (ie.toUpperCase() === "ISENTO") return "ISENTO";
  return onlyDigits(ie);
}
// ========================================================================

/* =========================================================================
   UF & Duplicidade de IE por UF (sem índice no DB)
   ========================================================================= */
async function getUFByCityId(cityId) {
  if (!cityId) return null;
  const [[row]] = await pool.query(
    'SELECT code FROM ocbr_city WHERE city_id = ? LIMIT 1',
    [cityId]
  );
  return row ? row.code : null;
}

async function existeIEDuplicadaMesmaUF({ ie, uf, ignorarEnterpriseId = null }) {
  if (!ie || ie.toUpperCase() === 'ISENTO' || !uf) return false;
  const params = [ie, uf];
  let sql = `
    SELECT e.enterprise_id
      FROM ocbr_enterprise e
      LEFT JOIN ocbr_city c ON e.city_id = c.city_id
     WHERE e.inscricao_estadual = ?
       AND c.code = ?
  `;
  if (ignorarEnterpriseId) {
    sql += ' AND e.enterprise_id <> ?';
    params.push(ignorarEnterpriseId);
  }
  sql += ' LIMIT 1';
  const [[dup]] = await pool.query(sql, params);
  return !!dup;
}
// ========================================================================


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

    // Filtro de busca (inclui BAIRRO agora)
    if (busca.trim()) {
      const cnpjLimpo = soNumeros(busca);
      const ieLimpa   = soNumeros(busca);

      whereClauses.push(`(
        e.razao LIKE ? OR 
        e.fantasia LIKE ? OR 
        REPLACE(REPLACE(REPLACE(e.cnpj, '.', ''), '/', ''), '-', '') LIKE ? OR
        c.name LIKE ? OR
        c.code LIKE ? OR
        e.bairro LIKE ? OR
        e.inscricao_estadual LIKE ? OR
        REPLACE(REPLACE(REPLACE(e.inscricao_estadual, '.', ''), '/', ''), '-', '') LIKE ?
      )`);
      const buscaParam = `%${busca}%`;
      const cnpjParam = `%${cnpjLimpo}%`;
      const ieParam = `%${ieLimpa}%`;
      params.push(
        buscaParam, // razao
        buscaParam, // fantasia
        cnpjParam,  // cnpj digits
        buscaParam, // cidade nome
        buscaParam, // UF
        buscaParam, // bairro
        buscaParam, // IE texto/ISENTO
        ieParam     // IE digits
      );
    }

    const whereSql = whereClauses.join(' AND ');

    const [rows] = await pool.query(
      `SELECT e.*, c.name as cidade_nome, c.code as cidade_uf
         FROM ocbr_enterprise e
         LEFT JOIN ocbr_city c ON e.city_id = c.city_id
        WHERE ${whereSql}
        ORDER BY e.fantasia ASC
        LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

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
    const dados = { ...req.body };

    if (!dados.fantasia || !dados.razao || !dados.cnpj) {
      return res.status(400).json({
        ok: false,
        error: 'Fantasia, Razão Social e CNPJ são obrigatórios.'
      });
    }

    const cnpj = soNumeros(dados.cnpj);
    if (!isCNPJ(cnpj)) {
      return res.status(422).json({ ok: false, error: 'CNPJ inválido.' });
    }

    // Unicidade usando CNPJ sanitizado
    const [[existente]] = await pool.query(
      `SELECT enterprise_id 
         FROM ocbr_enterprise 
        WHERE REPLACE(REPLACE(REPLACE(cnpj, '.', ''), '/', ''), '-', '') = ?`,
      [cnpj]
    );
    if (existente) {
      return res.status(400).json({ ok: false, error: 'CNPJ já cadastrado no sistema.' });
    }

    // Salvar CNPJ normalizado
    dados.cnpj = cnpj;

    // IE: validação e normalização simples
    if (dados.inscricao_estadual !== undefined) {
      if (!validarIEMinima(dados.inscricao_estadual)) {
        return res.status(422).json({ ok: false, error: 'Inscrição Estadual inválida.' });
      }
      const ieToSave = prepararIEParaSalvar(dados.inscricao_estadual);
      if (ieToSave && ieToSave.length > 45) {
        return res.status(422).json({ ok: false, error: 'Inscrição Estadual excede o limite de 45 caracteres.' });
      }
      dados.inscricao_estadual = ieToSave;

      // Duplicidade por UF (opcional, já implementada)
      if (ieToSave && ieToSave.toUpperCase() !== 'ISENTO' && dados.city_id) {
        const uf = await getUFByCityId(dados.city_id);
        if (uf) {
          const duplicada = await existeIEDuplicadaMesmaUF({ ie: ieToSave, uf });
          if (duplicada) {
            return res.status(409).json({
              ok: false,
              error: `Já existe empresa com esta Inscrição Estadual na UF ${uf}.`
            });
          }
        }
      }
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
    const payload = { ...req.body };

    // Remover campos que não pertencem à tabela
    delete payload.enterprise_id;
    delete payload.cidade_nome;
    delete payload.cidade_uf;
    delete payload.created_at;
    delete payload.updated_at;

    // CNPJ
    if (payload.cnpj !== undefined) {
      const cnpj = soNumeros(payload.cnpj);
      if (!isCNPJ(cnpj)) {
        return res.status(422).json({ ok: false, error: 'CNPJ inválido.' });
      }

      const [[existing]] = await pool.query(
        `SELECT enterprise_id 
           FROM ocbr_enterprise 
          WHERE REPLACE(REPLACE(REPLACE(cnpj, ".", ""), "/", ""), "-", "") = ? 
            AND enterprise_id != ?`,
        [cnpj, id]
      );
      if (existing) {
        return res.status(400).json({ ok: false, error: 'CNPJ já cadastrado para outra empresa.' });
      }

      payload.cnpj = cnpj;
    }

    // IE
    if (payload.inscricao_estadual !== undefined) {
      if (!validarIEMinima(payload.inscricao_estadual)) {
        return res.status(422).json({ ok: false, error: 'Inscrição Estadual inválida.' });
      }
      const ieToSave = prepararIEParaSalvar(payload.inscricao_estadual);
      if (ieToSave && ieToSave.length > 45) {
        return res.status(422).json({ ok: false, error: 'Inscrição Estadual excede o limite de 45 caracteres.' });
      }
      payload.inscricao_estadual = ieToSave;
    }

    // Duplicidade por UF no PUT (opcional, já implementada)
    let cityIdFinal = payload.city_id;
    if (cityIdFinal === undefined) {
      const [[empAtual]] = await pool.query(
        'SELECT city_id FROM ocbr_enterprise WHERE enterprise_id = ? LIMIT 1',
        [id]
      );
      cityIdFinal = empAtual ? empAtual.city_id : null;
    }
    let ieFinal = payload.inscricao_estadual;
    if (ieFinal === undefined) {
      const [[empAtualIE]] = await pool.query(
        'SELECT inscricao_estadual FROM ocbr_enterprise WHERE enterprise_id = ? LIMIT 1',
        [id]
      );
      ieFinal = empAtualIE ? empAtualIE.inscricao_estadual : null;
    }
    if (ieFinal && String(ieFinal).toUpperCase() !== 'ISENTO' && cityIdFinal) {
      const uf = await getUFByCityId(cityIdFinal);
      if (uf) {
        const duplicada = await existeIEDuplicadaMesmaUF({
          ie: ieFinal,
          uf,
          ignorarEnterpriseId: id
        });
        if (duplicada) {
          return res.status(409).json({
            ok: false,
            error: `Já existe empresa com esta Inscrição Estadual na UF ${uf}.`
          });
        }
      }
    }

    // >>>>> ADIÇÃO: impedir esvaziar obrigatórios no PUT <<<<<
    if (payload.razao !== undefined && String(payload.razao).trim() === "") {
      return res.status(422).json({ ok: false, error: "Razão Social não pode ser vazia." });
    }
    if (payload.fantasia !== undefined && String(payload.fantasia).trim() === "") {
      return res.status(422).json({ ok: false, error: "Nome Fantasia não pode ser vazio." });
    }
    if (payload.cnpj !== undefined && String(payload.cnpj).trim() === "") {
      return res.status(422).json({ ok: false, error: "CNPJ não pode ser vazio." });
    }
    // --------------------------------------------------------

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

// GET /api/admin/enterprises/:id/users
async function listarUsuariosDaEmpresa(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT 
         u.user_id,
         u.firstname,
         u.lastname,
         u.email,
         u.fone,
         u.status,
         c.name as cargo_nome
       FROM ocbr_user u
       LEFT JOIN ocbr_cargo c ON u.cargo_id = c.cargo_id
       WHERE u.enterprise_id = ?
       ORDER BY u.firstname ASC`,
      [id]
    );

    res.json({ ok: true, data: rows });
  } catch (e) {
    console.error("listarUsuariosDaEmpresa:", e);
    res.status(500).json({ ok: false, error: "Erro ao listar usuários da empresa." });
  }
}


module.exports = {
  listarEmpresas,
  buscarEmpresaPorId,
  criarEmpresa,
  atualizarEmpresa,
  ativarDesativarEmpresa,
  contadorAtivos,
  listarUsuariosDaEmpresa,
};
