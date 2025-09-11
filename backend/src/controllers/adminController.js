// src/controllers/adminController.js
const db = require('../config/db');

async function safeCount(sql, params = []) {
  try {
    const [[row]] = await db.query(sql, params);
    const v = row?.total ?? row?.cnt ?? 0;
    return Number(v) || 0;
  } catch {
    return 0;
  }
}

// Dashboard - Obter métricas básicas
exports.obterMetricasDashboard = async (_req, res) => {
  try {
    // Métricas básicas para o sistema simplificado
    const totalContatos = await safeCount(`SELECT COUNT(*) AS total FROM contatos`);
    const totalIpsAutorizados = await safeCount(`SELECT COUNT(*) AS total FROM ips_autorizados WHERE ativo = 1`);
    
    // Contatos recentes (últimos 7 dias)
    const contatosRecentes = await safeCount(`
      SELECT COUNT(*) AS total FROM contatos 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    return res.json({
      totalContatos,
      totalIpsAutorizados,
      contatosRecentes,
      visitantesSite: 0, // placeholder
      status: 'Sistema Simplificado Ativo'
    });
  } catch (error) {
    console.error('Erro em obterMetricasDashboard:', error);
    return res.status(500).json({ message: 'Erro ao carregar métricas.' });
  }
};

// Dashboard - Obter pendências básicas
exports.obterPendencias = async (_req, res) => {
  try {
    // Contatos não lidos (assumindo que há uma coluna 'lido')
    const contatosNaoLidos = await safeCount(`
      SELECT COUNT(*) AS total FROM contatos 
      WHERE lido = 0 OR lido IS NULL
    `);

    return res.json({
      contatos: contatosNaoLidos,
      ips: 0, // sem pendências de IP por enquanto
      total: contatosNaoLidos
    });
  } catch (error) {
    console.error('Erro em obterPendencias:', error);
    return res.status(500).json({ message: 'Erro ao carregar pendências.' });
  }
};

