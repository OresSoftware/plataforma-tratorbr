require("dotenv-flow").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const { generalLimiter, loginLimiter, contatoLimiter } = require("../middleware/rateLimiter");
const helmet = require("helmet");

const adminRoutes = require("./routes/adminRoutes");
const contatoRoutes = require("./routes/contatoRoutes");
const publicRoutes = require("./routes/publicRoutes");
const adminEnterpriseRoutes = require("./routes/adminEnterpriseRoutes");

const app = express();

app.set("trust proxy", 1);

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
      if (!origin) return cb(null, true);
      if (allowlist.has(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
  })
);

app.use(helmet());

app.use(express.json());
app.use(cookieParser());
app.use("/api/", generalLimiter);
app.get("/healthz", (req, res) => res.status(200).send("ok"));

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

app.post("/api/consent", (req, res) => {
  const { consent } = req.body;
  res.cookie("cookieConsent", consent, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    maxAge: 1000 * 60 * 60 * 24 * 365,
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

app.use("/api/admin/enterprises", adminEnterpriseRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contatos", contatoRoutes);

app.use((err, req, res, next) => {
  if (err && /Not allowed by CORS/i.test(err.message)) {
    return res.status(403).json({ error: "CORS bloqueado para esta origem." });
  }
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Erro interno do servidor." });
});

const PORT = process.env.PORT || 3001;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
  console.log("CORS allowlist:", Array.from(allowlist));
  console.log("Manufacturer dir:", manufacturerDir);
});
