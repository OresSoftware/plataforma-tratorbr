// backend/src/routes/adminRelatorios.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const relatorioController = require('../controllers/relatorioController');

// -------- Middleware de segurança -------- //
const verificarAdmin = async (req, res, next) => {
  try {
    const token = (req.headers.authorization || '').split(' ')[1];
    if (!token) return res.status(401).json({ code: 'NO_AUTH', message: 'Não autenticado' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ code: 'NO_AUTH', message: 'Token inválido' });
    }

    req.admin = {
      id: payload.id,
      username: payload.username,
      role: payload.role || 'gestor'
    };

    next();
  } catch (err) {
    console.error('verificarAdmin:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Erro interno de autenticação.' });
  }
};

// Aplicar middleware de autenticação em todas as rotas
router.use(verificarAdmin);

/**
 * POST /api/admin/relatorios/gerar
 * Gera um novo relatório
 * Body: { tipo: 'anual' | 'mensal' | 'semanal' }
 */
router.post('/gerar', relatorioController.gerarRelatorio);

/**
 * GET /api/admin/relatorios/historico
 * Lista histórico de relatórios gerados
 */
router.get('/historico', relatorioController.listarHistorico);

/**
 * GET /api/admin/relatorios/:id/download
 * Baixa um relatório específico
 */
router.get('/:id/download', relatorioController.baixarRelatorio);

/**
 * DELETE /api/admin/relatorios/:id
 * Exclui um relatório
 */
router.delete('/:id', relatorioController.excluirRelatorio);

module.exports = router;
