require("dotenv-flow").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const adminRoutes = require("./routes/adminRoutes");
const contatoRoutes = require("./routes/contatoRoutes");

const app = express();

// Se houver proxy reverso (NGINX/Cloudflare), isso garante IP correto
app.set("trust proxy", 1);

// ==== CORS DINÂMICO (lendo do .env) ====
function parseOrigins(list) {
  return (list || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
const allowlist = new Set(parseOrigins(process.env.FRONTEND_ORIGINS));

app.use(
  cors({
    origin: (origin, cb) => {
      // Permite requisições sem "Origin" (ex.: curl/healthcheck)
      if (!origin) return cb(null, true);
      if (allowlist.has(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
    // (opcional) se seu front mandar cabeçalhos extras:
    // allowedHeaders: ["Content-Type", "Authorization"],
    // methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());
app.use(cookieParser());

// Rotas de consentimento de cookies
app.post("/api/consent", (req, res) => {
  const { consent } = req.body; // "true" ou "false"
  res.cookie("cookieConsent", consent, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    maxAge: 1000 * 60 * 60 * 24 * 365, // 1 ano
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

// Suas rotas
app.use("/api/admin", adminRoutes);
app.use("/api/contatos", contatoRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
  console.log("CORS allowlist:", Array.from(allowlist));
});
