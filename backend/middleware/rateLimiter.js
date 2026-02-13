const rateLimit = require("express-rate-limit");

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: {
    ok: false,
    error: "Muitas requisições deste IP. Por favor, tente novamente após 15 minutos.",
  },
  standardHeaders: true, 
  legacyHeaders: false, 
  skip: (req) => {
    if (req.path === "/healthz") return true;
    return false;
  },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: {
    ok: false,
    error: "Muitas tentativas de login. Sua conta pode ser bloqueada. Tente novamente em 15 minutos.",
  },
  skipSuccessfulRequests: true, 
  standardHeaders: true,
  legacyHeaders: false,
});

const contatoLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 3, 
  message: {
    ok: false,
    error: "Limite de contatos atingido. Tente novamente mais tarde.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  loginLimiter,
  contatoLimiter,
};
