require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // ✅ novo

const adminRoutes = require('./routes/adminRoutes');
const contatoRoutes = require('./routes/contatoRoutes');

const app = express();

// Se houver proxy reverso (NGINX/Cloudflare), isso garante IP correto
app.set('trust proxy', 1);

// ✅ Ajuste do CORS: permite cookies vindos do frontend
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"], // ajuste para a URL do seu frontend
  credentials: true
}));

app.use(express.json());
app.use(cookieParser()); // ✅ habilita cookies

// ✅ Rotas de consentimento de cookies
app.post("/api/consent", (req, res) => {
  const { consent } = req.body; // "true" ou "false"

  res.cookie("cookieConsent", consent, {
    httpOnly: false, // acessível pelo JS do cliente
    secure: process.env.NODE_ENV === "production", // só HTTPS em produção
    sameSite: "Lax",
    maxAge: 1000 * 60 * 60 * 24 * 365 // 1 ano
  });

  res.json({ message: "Consentimento salvo" });
});

app.get("/api/consent", (req, res) => {
  res.json({ consent: req.cookies.cookieConsent || null });
});

app.post("/api/consent/clear", (req, res) => {
  res.clearCookie("cookieConsent");
  res.json({ message: "Consentimento removido" });
});

// Suas rotas já existentes
app.use('/api/admin', adminRoutes);
app.use('/api/contatos', contatoRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend simplificado rodando na porta ${PORT}`);
});
