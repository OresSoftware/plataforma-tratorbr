// backend/src/utils/paths.js
const path = require("path");
const fs = require("fs");

function getManufacturerDir() {
  // Ajuste este resolve se sua árvore for diferente.
  // Ele sobe 2 níveis a partir de /backend/src/utils/paths.js até /backend
  // e então navega para /frontend/public/images/manufacturer
  const dir = path.resolve(__dirname, "../../../frontend/public/images/manufacturer");
  return dir;
}

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

module.exports = { getManufacturerDir, ensureDirSync };
