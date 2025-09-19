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

// Dashboard - Obter métricas simplificadas
exports.obterMetricasDashboard = async (_req, res) => {
  try {
    // 1. Admins Cadastrados (IPs cadastrados)
    const adminsIpsCadastrados = await safeCount(`
      SELECT COUNT(DISTINCT admin_id) AS total 
      FROM admin_ips 
      WHERE ativo = 1
    `);
    
    // 2. Admins Online (IPs que fizeram login nas últimas 24 horas)
    const adminsOnline = await safeCount(`
      SELECT COUNT(DISTINCT admin_id) AS total 
      FROM admin_ips 
      WHERE ativo = 1 
      AND last_seen_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);
    
    // 3. Contatos Pendentes
    const contatosPendentes = await safeCount(`
      SELECT COUNT(*) AS total 
      FROM contatos 
      WHERE status = 'pendente' 
      AND deleted_at IS NULL
    `);

    return res.json({
      adminsIpsCadastrados,
      adminsOnline,
      contatosPendentes
    });
  } catch (error) {
    console.error('Erro em obterMetricasDashboard:', error);
    return res.status(500).json({ message: 'Erro ao carregar métricas.' });
  }
};

// Dashboard - Obter pendências (mantido para compatibilidade, mas simplificado)
exports.obterPendencias = async (_req, res) => {
  try {
    // Apenas contatos pendentes
    const contatosPendentes = await safeCount(`
      SELECT COUNT(*) AS total 
      FROM contatos 
      WHERE status = 'pendente' 
      AND deleted_at IS NULL
    `);

    return res.json({
      contatos: contatosPendentes,
      total: contatosPendentes
    });
  } catch (error) {
    console.error('Erro em obterPendencias:', error);
    return res.status(500).json({ message: 'Erro ao carregar pendências.' });
  }
};
