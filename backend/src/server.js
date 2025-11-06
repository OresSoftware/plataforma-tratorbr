// src/server.js
require("dotenv-flow").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const adminRoutes = require("./routes/adminRoutes");
const contatoRoutes = require("./routes/contatoRoutes");
const publicRoutes = require("./routes/publicRoutes");
const adminEnterpriseRoutes = require("./routes/adminEnterpriseRoutes");

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
const allowlist = new Set(parseOrigins(process.env.FRONTEND_ORIGINS || ""));

app.use(
  cors({
    origin: (origin, cb) => {
      // Permite requisições sem "Origin" (ex.: curl/healthcheck)
      if (!origin) return cb(null, true);
      if (allowlist.has(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
  })
);

// Body & cookies
app.use(express.json());
app.use(cookieParser());

// ---------- Healthcheck (sem /api) ----------
app.get("/healthz", (req, res) => res.status(200).send("ok"));

/**
 * ---------- Servir logos locais ----------
 * Expõe a pasta das logos para o front:
 *   GET /images/manufacturer/<arquivo.ext>
 *
 * Defina MANUFACTURER_DIR no .env se quiser sobrescrever.
 * Ex.: MANUFACTURER_DIR=/app/frontend/public/images/manufacturer
 */
const manufacturerDir =
  process.env.MANUFACTURER_DIR ||
  path.resolve(__dirname, "../frontend/public/images/manufacturer");

app.use(
  "/images/manufacturer",
  express.static(manufacturerDir, {
    etag: true,
    maxAge: "7d",
    fallthrough: true,
  })
);

// ---------- Rotas de consentimento de cookies ----------
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

// ---------- Suas rotas /api ----------
app.use("/api/admin/enterprises", adminEnterpriseRoutes);
app.use("/api/public", publicRoutes);  
app.use("/api/admin", adminRoutes);
app.use("/api/contatos", contatoRoutes);

// ---------- Tratamento básico de erros (inclui erro de CORS) ----------
app.use((err, req, res, next) => {
  if (err && /Not allowed by CORS/i.test(err.message)) {
    return res.status(403).json({ error: "CORS bloqueado para esta origem." });
  }
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Erro interno do servidor." });
});

const PORT = process.env.PORT || 3001;
const HOST = "0.0.0.0"; // importante para Docker/containers

app.listen(PORT, HOST, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
  console.log("CORS allowlist:", Array.from(allowlist));
  console.log("Manufacturer dir:", manufacturerDir);
});
