// routes/excluir-conta.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/excluir-conta', async (req, res) => {
  const { email, recaptchaToken } = req.body;

  try {
    // Verificar reCAPTCHA
    const recaptchaResponse = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: recaptchaToken,
          remoteip: req.ip
        }
      }
    );

    if (!recaptchaResponse.data.success) {
      return res.status(400).json({
        error: 'Verificação reCAPTCHA falhou'
      });
    }

    // Processar exclusão da conta
    // ... sua lógica aqui ...

    res.json({ success: true, message: 'Conta excluída com sucesso' });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;