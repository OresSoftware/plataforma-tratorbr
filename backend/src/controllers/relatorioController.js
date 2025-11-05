// backend/src/controllers/relatorioController.js
const db = require('../config/db');
const { gerarPDFRelatorio } = require('../services/pdfService');
const fs = require('fs').promises;
const path = require('path');
const { startOfDay, endOfDay, subDays, subMonths, subYears, format } = require('date-fns');

/**
 * Calcula as datas de início e fim conforme o tipo de relatório
 */
function calcularPeriodo(tipo) {
  const hoje = new Date();
  let inicio, fim, inicioAnterior, fimAnterior;

  switch (tipo) {
    case 'semanal':
      // Últimos 7 dias
      fim = endOfDay(hoje);
      inicio = startOfDay(subDays(hoje, 6));

      // Período anterior (7 dias antes)
      fimAnterior = endOfDay(subDays(inicio, 1));
      inicioAnterior = startOfDay(subDays(fimAnterior, 6));
      break;

    case 'mensal':
      // Mês atual (do dia 1 até hoje)
      fim = endOfDay(hoje);
      inicio = startOfDay(new Date(hoje.getFullYear(), hoje.getMonth(), 1));

      // Mês anterior completo
      const mesAnterior = subMonths(inicio, 1);
      inicioAnterior = startOfDay(mesAnterior);
      fimAnterior = endOfDay(new Date(mesAnterior.getFullYear(), mesAnterior.getMonth() + 1, 0));
      break;

    case 'anual':
      // Últimos 12 meses
      fim = endOfDay(hoje);
      inicio = startOfDay(subYears(hoje, 1));

      // 12 meses anteriores
      fimAnterior = endOfDay(subDays(inicio, 1));
      inicioAnterior = startOfDay(subYears(fimAnterior, 1));
      break;

    default:
      throw new Error('Tipo de relatório inválido');
  }

  return {
    inicio: format(inicio, 'yyyy-MM-dd'),
    fim: format(fim, 'yyyy-MM-dd'),
    inicioAnterior: format(inicioAnterior, 'yyyy-MM-dd'),
    fimAnterior: format(fimAnterior, 'yyyy-MM-dd'),
  };
}

/**
 * Busca dados gerais (totais)
 */
async function buscarDadosGerais() {
  // Empresas
  const [empresasAtivas] = await db.query(
    'SELECT COUNT(*) as total FROM ocbr_enterprise WHERE ativo = 1'
  );
  const [empresasInativas] = await db.query(
    'SELECT COUNT(*) as total FROM ocbr_enterprise WHERE ativo = 0'
  );
  const [empresasMatriz] = await db.query(
    'SELECT COUNT(*) as total FROM ocbr_enterprise WHERE matriz_filial = "matriz"'
  );
  const [empresasFilial] = await db.query(
    'SELECT COUNT(*) as total FROM ocbr_enterprise WHERE matriz_filial = "filial"'
  );

  // Usuários
  const [usuariosAtivos] = await db.query(
    'SELECT COUNT(*) as total FROM ocbr_user WHERE status = 1'
  );
  const [usuariosInativos] = await db.query(
    'SELECT COUNT(*) as total FROM ocbr_user WHERE status = 0'
  );

  // Contatos
  const [contatosPendentes] = await db.query(
    'SELECT COUNT(*) as total FROM contatos WHERE status = "pendente"'
  );
  const [contatosRespondidos] = await db.query(
    'SELECT COUNT(*) as total FROM contatos WHERE status = "respondido"'
  );

  return {
    empresas: {
      total: empresasAtivas[0].total + empresasInativas[0].total,
      ativas: empresasAtivas[0].total,
      inativas: empresasInativas[0].total,
      matriz: empresasMatriz[0].total,
      filial: empresasFilial[0].total,
    },
    usuarios: {
      total: usuariosAtivos[0].total + usuariosInativos[0].total,
      ativos: usuariosAtivos[0].total,
      inativos: usuariosInativos[0].total,
    },
    contatos: {
      total: contatosPendentes[0].total + contatosRespondidos[0].total,
      pendentes: contatosPendentes[0].total,
      respondidos: contatosRespondidos[0].total,
      taxaResposta: contatosPendentes[0].total + contatosRespondidos[0].total > 0
        ? ((contatosRespondidos[0].total / (contatosPendentes[0].total + contatosRespondidos[0].total)) * 100).toFixed(1)
        : 0,
    },
  };
}

/**
 * Busca dados do período específico
 */
async function buscarDadosPeriodo(inicio, fim) {
  // Novas empresas no período
  const [novasEmpresas] = await db.query(
    'SELECT COUNT(*) as total FROM ocbr_enterprise WHERE DATE(created_at) BETWEEN ? AND ?',
    [inicio, fim]
  );

  // Novos usuários no período
  const [novosUsuarios] = await db.query(
    'SELECT COUNT(*) as total FROM ocbr_user WHERE DATE(date_added) BETWEEN ? AND ?',
    [inicio, fim]
  );

  // Contatos no período
  const [contatosPeriodo] = await db.query(
    'SELECT COUNT(*) as total FROM contatos WHERE DATE(created_at) BETWEEN ? AND ?',
    [inicio, fim]
  );

  return {
    novasEmpresas: novasEmpresas[0].total,
    novosUsuarios: novosUsuarios[0].total,
    contatosPeriodo: contatosPeriodo[0].total,
  };
}

/**
 * Busca Top 5 empresas com mais usuários
 */
async function buscarTop5Empresas() {
  const [rows] = await db.query(`
    SELECT 
      COALESCE(e.fantasia, e.razao) as nome_empresa,
      COUNT(u.user_id) as total_usuarios
    FROM ocbr_enterprise e
    LEFT JOIN ocbr_user u ON u.enterprise_id = e.enterprise_id
    WHERE e.ativo = 1
    GROUP BY e.enterprise_id, e.fantasia, e.razao
    ORDER BY total_usuarios DESC
    LIMIT 5
  `);
  return rows;
}

/**
 * Busca Top 5 cidades com mais empresas
 */
async function buscarTop5Cidades() {
  const [rows] = await db.query(`
    SELECT 
      c.name AS cidade,
      COUNT(e.enterprise_id) AS total_empresas
    FROM ocbr_enterprise e
    INNER JOIN ocbr_city c ON e.city_id = c.city_id
    WHERE e.ativo = 1
    GROUP BY c.city_id, c.name
    ORDER BY total_empresas DESC
    LIMIT 5
  `);
  return rows;
}

/**
 * Busca Top 5 estados com mais empresas
 */
// async function buscarTop5Estados() {
//   const [rows] = await db.query(`
//     SELECT 
//       e.uf,
//       COUNT(e.enterprise_id) AS total_empresas
//     FROM ocbr_enterprise e
//     WHERE e.ativo = 1 AND e.uf IS NOT NULL AND e.uf <> ''
//     GROUP BY e.uf
//     ORDER BY total_empresas DESC
//     LIMIT 5
//   `);
//   return rows;
// }

/**
 * Busca dados para gráfico de pizza (usuários por empresa)
 */
async function buscarDadosPizza() {
  const [rows] = await db.query(`
    SELECT 
      COALESCE(e.fantasia, e.razao) as name,
      COUNT(u.user_id) as value
    FROM ocbr_enterprise e
    LEFT JOIN ocbr_user u ON u.enterprise_id = e.enterprise_id
    WHERE e.ativo = 1
    GROUP BY e.enterprise_id, e.fantasia, e.razao
    HAVING value > 0
    ORDER BY value DESC
    LIMIT 8
  `);

  // Calcular "Outros"
  const [totalUsuarios] = await db.query('SELECT COUNT(*) as total FROM ocbr_user WHERE status = 1');
  const somaTop8 = rows.reduce((sum, r) => sum + r.value, 0);
  const outros = totalUsuarios[0].total - somaTop8;

  if (outros > 0) {
    rows.push({ name: 'Outros', value: outros });
  }

  return rows;
}

/**
 * Busca dados para gráfico de linha (cadastros por dia)
 */
async function buscarDadosLinha(inicio, fim, tipo = 'usuarios') {
  const tabela = tipo === 'usuarios' ? 'ocbr_user' : 'ocbr_enterprise';
  const campoData = tipo === 'usuarios' ? 'date_added' : 'created_at';

  const [rows] = await db.query(`
    SELECT 
      DATE(${campoData}) as date,
      COUNT(*) as valor
    FROM ${tabela}
    WHERE DATE(${campoData}) BETWEEN ? AND ?
    GROUP BY DATE(${campoData})
    ORDER BY date ASC
  `, [inicio, fim]);

  return rows;
}

/**
 * Calcula % de crescimento
 */
function calcularCrescimento(atual, anterior) {
  if (anterior === 0) return atual > 0 ? 100 : 0;
  return (((atual - anterior) / anterior) * 100).toFixed(1);
}

/**
 * ROTA: Gerar relatório
 */
exports.gerarRelatorio = async (req, res) => {
  try {
    const { tipo } = req.body; // 'anual', 'mensal', 'semanal'

    if (!['anual', 'mensal', 'semanal'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de relatório inválido' });
    }

    // Calcular períodos
    const { inicio, fim, inicioAnterior, fimAnterior } = calcularPeriodo(tipo);

    // Buscar dados
    const dadosGerais = await buscarDadosGerais();
    const dadosPeriodoAtual = await buscarDadosPeriodo(inicio, fim);
    const dadosPeriodoAnterior = await buscarDadosPeriodo(inicioAnterior, fimAnterior);

    // Calcular comparações
    const comparacoes = {
      empresas: calcularCrescimento(dadosPeriodoAtual.novasEmpresas, dadosPeriodoAnterior.novasEmpresas),
      usuarios: calcularCrescimento(dadosPeriodoAtual.novosUsuarios, dadosPeriodoAnterior.novosUsuarios),
      contatos: calcularCrescimento(dadosPeriodoAtual.contatosPeriodo, dadosPeriodoAnterior.contatosPeriodo),
    };

    // Buscar rankings
    const top5Empresas = await buscarTop5Empresas();
    const top5Cidades = await buscarTop5Cidades();
    // const top5Estados = await buscarTop5Estados();

    // Buscar dados para gráficos
    const dadosPizza = await buscarDadosPizza();
    const dadosLinha = await buscarDadosLinha(inicio, fim, 'usuarios');

    // Montar dados completos
    const dadosRelatorio = {
      tipo,
      periodo: { inicio, fim },
      periodoAnterior: { inicio: inicioAnterior, fim: fimAnterior },
      dadosGerais,
      dadosPeriodo: dadosPeriodoAtual,
      comparacoes,
      rankings: {
        empresas: top5Empresas,
        cidades: top5Cidades,
        // estados: top5Estados,
      },
      graficos: {
        pizza: dadosPizza,
        linha: dadosLinha,
      },
    };

    // Gerar PDF
    const nomeArquivo = `relatorio-${tipo}-${Date.now()}.pdf`;
    const caminhoArquivo = path.join(__dirname, '../../uploads/relatorios', nomeArquivo);

    // Garantir que a pasta existe
    await fs.mkdir(path.dirname(caminhoArquivo), { recursive: true });

    await gerarPDFRelatorio(dadosRelatorio, caminhoArquivo);

    // Obter tamanho do arquivo
    const stats = await fs.stat(caminhoArquivo);

    // Salvar no banco
    const [result] = await db.query(
      `INSERT INTO relatorios (tipo, periodo_inicio, periodo_fim, arquivo_nome, arquivo_path, tamanho_bytes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [tipo, inicio, fim, nomeArquivo, caminhoArquivo, stats.size]
    );

    res.json({
      success: true,
      relatorio: {
        id: result.insertId,
        tipo,
        periodo: { inicio, fim },
        arquivo: nomeArquivo,
        tamanho: stats.size,
        url: `/admin/relatorios/${result.insertId}/download`,
      },
    });
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
};

/**
 * ROTA: Listar histórico
 */
exports.listarHistorico = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        id,
        tipo,
        periodo_inicio,
        periodo_fim,
        arquivo_nome,
        tamanho_bytes,
        created_at
      FROM relatorios
      ORDER BY created_at DESC
      LIMIT 20
    `);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Erro ao listar histórico:', error);
    res.status(500).json({ error: 'Erro ao listar histórico' });
  }
};

/**
 * ROTA: Baixar relatório
 */
exports.baixarRelatorio = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      'SELECT arquivo_path, arquivo_nome FROM relatorios WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Relatório não encontrado' });
    }

    const { arquivo_path, arquivo_nome } = rows[0];

    // Verificar se o arquivo existe
    try {
      await fs.access(arquivo_path);
    } catch {
      return res.status(404).json({ error: 'Arquivo não encontrado no servidor' });
    }

    res.download(arquivo_path, arquivo_nome);
  } catch (error) {
    console.error('Erro ao baixar relatório:', error);
    res.status(500).json({ error: 'Erro ao baixar relatório' });
  }
};

/**
 * ROTA: Excluir relatório
 */
exports.excluirRelatorio = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      'SELECT arquivo_path FROM relatorios WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Relatório não encontrado' });
    }

    const { arquivo_path } = rows[0];

    // Excluir arquivo físico
    try {
      await fs.unlink(arquivo_path);
    } catch (err) {
      console.warn('Arquivo já foi excluído:', err.message);
    }

    // Excluir do banco
    await db.query('DELETE FROM relatorios WHERE id = ?', [id]);

    res.json({ success: true, message: 'Relatório excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir relatório:', error);
    res.status(500).json({ error: 'Erro ao excluir relatório' });
  }
};
