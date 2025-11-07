// backend/src/utils/paths.js
const path = require("path");
const fs = require("fs");

function getManufacturerDir() {
  // 1º: se houver variável de ambiente, usa ela (produção)
  const envDir = process.env.LOGO_DIR;
  if (envDir && envDir.trim()) {
    return envDir.trim();
  }
  // 2º: fallback (desenvolvimento): dentro do repo
  return path.resolve(__dirname, "../../../frontend/public/images/manufacturer");
}

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

module.exports = { getManufacturerDir, ensureDirSync };
