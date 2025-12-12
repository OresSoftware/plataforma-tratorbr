const path = require("path");
const fs = require("fs");

function getManufacturerDir() {
  const envDir = process.env.LOGO_DIR;
  if (envDir && envDir.trim()) {
    return envDir.trim();
  }
  return path.resolve(__dirname, "../../../frontend/public/images/manufacturer");
}

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

module.exports = { getManufacturerDir, ensureDirSync };
