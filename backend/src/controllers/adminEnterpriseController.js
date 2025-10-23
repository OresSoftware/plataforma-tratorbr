// backend/src/controllers/adminEnterpriseController.js
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

//  Inscrição Estadual (IE) - Normalização e validação mínima
const normalizeIE = (value = "") => String(value || "").trim();
const onlyDigits = (s = "") => String(s).replace(/\D/g, "");

function validarIEMinima(ieRaw = "") {
  const ie = normalizeIE(ieRaw);
  if (!ie) return true; // permitir vazio
  if (ie.toUpperCase() === "ISENTO") return true;
  const digits = onlyDigits(ie);
  if (digits.length < 1 || digits.length > 14) return false;
  return /^\d+$/.test(digits);
}

function prepararIEParaSalvar(ieRaw = "") {
  const ie = normalizeIE(ieRaw);
  if (!ie) return null;
  if (ie.toUpperCase() === "ISENTO") return "ISENTO";
  return onlyDigits(ie);
}

//  UF & Duplicidade de IE por UF
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

//  GET /api/admin/enterprises | EMPRESAS
//  - Filtro + SCORE (campo calculado no SELECT — não existe no UPDATE)
async function listarEmpresas(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const pageSize = Math.min(100, Math.max(5, parseInt(req.query.pageSize || "20", 10)));
    const offset = (page - 1) * pageSize;

    const status = String(req.query.status || 'todos').toLowerCase();
    const buscaRaw = String(req.query.busca || '').trim();

    const like = `%${buscaRaw}%`;
    const cnpjDigits = soNumeros(buscaRaw);
    const ieDigits   = soNumeros(buscaRaw);
    const buscaIsento = buscaRaw.toUpperCase() === 'ISENTO';

    const where = ['1=1'];
    const paramsWhere = [];

    if (status === 'ativos')   where.push('e.ativo = 1');
    if (status === 'inativos') where.push('e.ativo = 0');

    if (buscaRaw) {
      const blocos = [];
      const blocParams = [];

      blocos.push('e.razao LIKE ?', 'e.fantasia LIKE ?');
      blocParams.push(like, like);

      blocos.push('c.name LIKE ?', 'c.code LIKE ?');
      blocParams.push(like, like);

      blocos.push('e.bairro LIKE ?');
      blocParams.push(like);

      blocos.push('e.inscricao_estadual LIKE ?');
      blocParams.push(like);

      if (ieDigits) {
        blocos.push("REPLACE(REPLACE(REPLACE(e.inscricao_estadual, '.', ''), '/', ''), '-', '') LIKE ?");
        blocParams.push(`%${ieDigits}%`);
      }

      if (cnpjDigits) {
        blocos.push("REPLACE(REPLACE(REPLACE(e.cnpj, '.', ''), '/', ''), '-', '') LIKE ?");
        blocParams.push(`%${cnpjDigits}%`);
      }

      if (buscaIsento) {
        blocos.push("UPPER(e.inscricao_estadual) = 'ISENTO'");
      }

      if (blocos.length) {
        where.push(`(${blocos.join(' OR ')})`);
        paramsWhere.push(...blocParams);
      }
    }

    const whereSql = where.join(' AND ');

    const pesos = {
      fantasia: 10,
      razao: 9,
      cidade: 8,
      uf: 8,
      bairro: 6,
      cnpjEq: 30,
      cnpjLike: 12,
      ieEq: 18,
      ieLike: 8,
      isento: 7,
    };

    const paramsScore = [];
    const eqCNPJ   = cnpjDigits && cnpjDigits.length === 14 ? cnpjDigits : '__NO_MATCH__';
    const eqIE     = ieDigits   && ieDigits.length   >= 2   ? ieDigits   : '__NO_MATCH__';
    const likeCNPJ = cnpjDigits ? `%${cnpjDigits}%` : '__NO_MATCH__';
    const likeIE   = ieDigits   ? `%${ieDigits}%`   : '__NO_MATCH__';
    const isentoChave = buscaIsento ? 'ISENTO' : '__NO_MATCH__';

    paramsScore.push(like, like, like, like, like);
    paramsScore.push(eqCNPJ, likeCNPJ, eqIE, likeIE, isentoChave);

    const scoreExpr = `
      (
        (e.fantasia LIKE ?) * ${pesos.fantasia} +
        (e.razao LIKE ?) * ${pesos.razao} +
        (c.name LIKE ?) * ${pesos.cidade} +
        (c.code LIKE ?) * ${pesos.uf} +
        (e.bairro LIKE ?) * ${pesos.bairro} +
        (REPLACE(REPLACE(REPLACE(e.cnpj, '.', ''), '/', ''), '-', '') = ?) * ${pesos.cnpjEq} +
        (REPLACE(REPLACE(REPLACE(e.cnpj, '.', ''), '/', ''), '-', '') LIKE ?) * ${pesos.cnpjLike} +
        (REPLACE(REPLACE(REPLACE(e.inscricao_estadual, '.', ''), '/', ''), '-', '') = ?) * ${pesos.ieEq} +
        (REPLACE(REPLACE(REPLACE(e.inscricao_estadual, '.', ''), '/', ''), '-', '') LIKE ?) * ${pesos.ieLike} +
        (UPPER(e.inscricao_estadual) = UPPER(?)) * ${pesos.isento}
      ) AS score
    `;

    const [rows] = await pool.query(
      `
      SELECT 
        e.*,
        c.name AS cidade_nome,
        c.code AS cidade_uf,
        ${scoreExpr}
      FROM ocbr_enterprise e
      LEFT JOIN ocbr_city c ON e.city_id = c.city_id
      WHERE ${whereSql}
      ORDER BY score DESC, e.fantasia ASC
      LIMIT ? OFFSET ?
      `,
      [...paramsScore, ...paramsWhere, pageSize, offset]
    );

    const [[{ total }]] = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM ocbr_enterprise e
      LEFT JOIN ocbr_city c ON e.city_id = c.city_id
      WHERE ${whereSql}
      `,
      paramsWhere
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

    delete dados.enterprise_id;
    delete dados.score;
    delete dados.cidade_nome;
    delete dados.cidade_uf;
    delete dados.created_at;
    delete dados.updated_at;

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

    const [[existente]] = await pool.query(
      `SELECT enterprise_id 
         FROM ocbr_enterprise 
        WHERE REPLACE(REPLACE(REPLACE(cnpj, '.', ''), '/', ''), '-', '') = ?`,
      [cnpj]
    );
    if (existente) {
      return res.status(400).json({ ok: false, error: 'CNPJ já cadastrado no sistema.' });
    }

    dados.cnpj = cnpj;

    if (dados.inscricao_estadual !== undefined) {
      if (!validarIEMinima(dados.inscricao_estadual)) {
        return res.status(422).json({ ok: false, error: 'Inscrição Estadual inválida.' });
      }
      const ieToSave = prepararIEParaSalvar(dados.inscricao_estadual);
      if (ieToSave && ieToSave.length > 45) {
        return res.status(422).json({ ok: false, error: 'Inscrição Estadual excede o limite de 45 caracteres.' });
      }
      dados.inscricao_estadual = ieToSave;

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

    delete payload.enterprise_id;
    delete payload.score;         
    delete payload.cidade_nome;
    delete payload.cidade_uf;
    delete payload.created_at;
    delete payload.updated_at;

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

    if (payload.razao !== undefined && String(payload.razao).trim() === "") {
      return res.status(422).json({ ok: false, error: "Razão Social não pode ser vazia." });
    }
    if (payload.fantasia !== undefined && String(payload.fantasia).trim() === "") {
      return res.status(422).json({ ok: false, error: "Nome Fantasia não pode ser vazio." });
    }
    if (payload.cnpj !== undefined && String(payload.cnpj).trim() === "") {
      return res.status(422).json({ ok: false, error: "CNPJ não pode ser vazio." });
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

// GET /api/admin/enterprises/:id/cobranca | ENDEREÇO DE COBRANÇA (ocbr_enterprise_cobranca)
async function obterEnderecoCobranca(req, res) {
  try {
    const enterpriseId = Number(req.params.id);
    if (!enterpriseId) return res.status(400).json({ ok: false, error: "ID inválido." });

    const [rows] = await pool.query(`
      SELECT cb.*, ci.name AS cidade_nome, ci.code AS cidade_uf
        FROM ocbr_enterprise_cobranca cb
        LEFT JOIN ocbr_city ci ON cb.city_id = ci.city_id
       WHERE cb.enterprise_id = ?
       LIMIT 1
    `, [enterpriseId]);

    res.json({ ok: true, data: rows[0] || null });
  } catch (e) {
    console.error("obterEnderecoCobranca:", e);
    res.status(500).json({ ok: false, error: "Erro ao obter endereço de cobrança." });
  }
}

// PUT /api/admin/enterprises/:id/cobranca  (upsert)
async function salvarEnderecoCobranca(req, res) {
  try {
    const enterpriseId = Number(req.params.id);
    if (!enterpriseId) return res.status(400).json({ ok: false, error: "ID inválido." });

    const input = req.body || {};

    // garante que a empresa existe
    const [[emp]] = await pool.query(
      'SELECT enterprise_id, endereco, numero, complemento, bairro, cep, city_id FROM ocbr_enterprise WHERE enterprise_id = ? LIMIT 1',
      [enterpriseId]
    );
    if (!emp) {
      return res.status(404).json({ ok: false, error: 'Empresa não encontrada.' });
    }

    let toSave;

    if (input.same_as_enterprise) {
      // Copiar do endereço principal da empresa
      toSave = {
        endereco:    emp.endereco || null,
        numero:      emp.numero || null,
        complemento: emp.complemento || null,
        bairro:      emp.bairro || null,
        cep:         emp.cep ? String(emp.cep).slice(0, 10) : null,
        city_id:     emp.city_id || null,
        updated_at:  new Date()
      };
    } else {
      // Usar o payload enviado
      toSave = {
        endereco:    input.endereco ?? null,
        numero:      input.numero ?? null,
        complemento: input.complemento ?? null,
        bairro:      input.bairro ?? null,
        cep:         input.cep ? String(input.cep).slice(0, 10) : null,
        city_id:     input.city_id ?? null,
        updated_at:  new Date()
      };
    }

    // verifica se já existe cobrança
    const [[existe]] = await pool.query(
      'SELECT cobranca_id FROM ocbr_enterprise_cobranca WHERE enterprise_id = ? LIMIT 1',
      [enterpriseId]
    );

    if (existe) {
      await pool.query(
        'UPDATE ocbr_enterprise_cobranca SET ? WHERE enterprise_id = ?',
        [toSave, enterpriseId]
      );
    } else {
      await pool.query(
        'INSERT INTO ocbr_enterprise_cobranca SET ?',
        [{ ...toSave, enterprise_id: enterpriseId, created_at: new Date() }]
      );
    }

    // retorna o registro atualizado
    const [rows] = await pool.query(`
      SELECT cb.*, ci.name AS cidade_nome, ci.code AS cidade_uf
        FROM ocbr_enterprise_cobranca cb
        LEFT JOIN ocbr_city ci ON cb.city_id = ci.city_id
       WHERE cb.enterprise_id = ?
       LIMIT 1
    `, [enterpriseId]);

    res.json({ ok: true, message: 'Endereço de cobrança salvo com sucesso!', data: rows[0] || null });
  } catch (e) {
    console.error("salvarEnderecoCobranca:", e);
    res.status(500).json({ ok: false, error: "Erro ao salvar endereço de cobrança." });
  }
}

// DELETE /api/admin/enterprises/:id/cobranca
async function removerEnderecoCobranca(req, res) {
  try {
    const enterpriseId = Number(req.params.id);
    if (!enterpriseId) return res.status(400).json({ ok: false, error: "ID inválido." });

    await pool.query(
      'DELETE FROM ocbr_enterprise_cobranca WHERE enterprise_id = ?',
      [enterpriseId]
    );

    res.json({ ok: true, message: 'Endereço de cobrança removido.' });
  } catch (e) {
    console.error("removerEnderecoCobranca:", e);
    res.status(500).json({ ok: false, error: "Erro ao remover endereço de cobrança." });
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
  obterEnderecoCobranca,
  salvarEnderecoCobranca,
  removerEnderecoCobranca,
};
