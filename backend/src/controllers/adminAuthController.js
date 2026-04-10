const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  buildPanelSession,
  getPanelJwtSecret,
  getPanelUserById,
  getPanelUserByIdentifier,
  verifyTurnstileToken,
} = require("../services/panelAuthService");

function getTurnstileFailureMessage(turnstile = {}) {
  switch (turnstile.reason) {
    case "missing_token":
    case "invalid_token":
    case "siteverify_failed":
      return "Validação de segurança inválida.";
    case "timeout_or_duplicate":
      return "Token expirado, tente novamente.";
    case "not_configured":
    case "invalid_secret":
      return "Falha ao validar segurança do login.";
    case "request_failed":
      return "Falha ao validar segurança do login.";
    default:
      return "Validação de segurança inválida.";
  }
}

exports.loginAdmin = async (req, res) => {
  try {
    const identifier = String(
      req.body?.identifier || req.body?.username || req.body?.email || ""
    ).trim();
    const password = req.body?.password || req.body?.senha || "";
    const turnstileToken = String(req.body?.turnstileToken || "").trim();
    const remoteip =
      req.headers["cf-connecting-ip"] ||
      req.headers["x-forwarded-for"] ||
      req.ip;

    if (!identifier || !password) {
      return res.status(400).json({ message: "Identificação e senha são obrigatórios." });
    }

    console.info("[Painel Login] Recebida tentativa de login", {
      identifier,
      hasTurnstileToken: Boolean(turnstileToken),
      remoteip,
    });

    const turnstile = await verifyTurnstileToken(turnstileToken, remoteip);
    if (turnstile.enabled && !turnstile.success) {
      const turnstileMessage = getTurnstileFailureMessage(turnstile);

      console.warn("[Painel Login] Validacao Turnstile rejeitada", {
        identifier,
        reason: turnstile.reason,
        httpStatus: turnstile.httpStatus || null,
        errors: turnstile.errors || [],
        body: turnstile.body || null,
      });

      return res.status(400).json({
        message: turnstileMessage,
      });
    }

    const user = await getPanelUserByIdentifier(identifier);
    if (!user) {
      return res.status(401).json({ message: "Falha na autenticação." });
    }

    const senhaPrincipalOk = user.password
      ? await bcrypt.compare(password, user.password)
      : false;

    let senhaTemporariaOk = false;
    const limite = user.tmp_limite ? new Date(user.tmp_limite) : null;
    if (!senhaPrincipalOk && user.tmp_password && limite && limite > new Date()) {
      senhaTemporariaOk = await bcrypt.compare(password, user.tmp_password);
    }

    if (!senhaPrincipalOk && !senhaTemporariaOk) {
      return res.status(401).json({ message: "Falha na autenticação." });
    }

    if (Number(user.status) !== 1) {
      return res.status(401).json({ message: "Usuário inativo." });
    }

    const jwtSecret = getPanelJwtSecret();
    if (!jwtSecret) {
      return res.status(500).json({ message: "JWT não configurado para o painel." });
    }

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, tipo: "panel" },
      jwtSecret,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      admin: buildPanelSession(user),
    });
  } catch (e) {
    console.error("Erro no login do painel:", e);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

exports.verificarToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Token não fornecido." });
    }

    const decoded = jwt.verify(token, getPanelJwtSecret());

    if (decoded.tipo !== "panel") {
      return res.status(403).json({ message: "Acesso negado." });
    }

    const user = await getPanelUserById(decoded.user_id);
    if (!user || Number(user.status) !== 1) {
      return res.status(401).json({ message: "Sessão inválida." });
    }

    res.json({
      valid: true,
      admin: buildPanelSession(user),
    });
  } catch (error) {
    res.status(401).json({ message: "Token inválido." });
  }
};
