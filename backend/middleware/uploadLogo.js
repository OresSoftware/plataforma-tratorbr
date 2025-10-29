// backend/middleware/uploadLogo.js
const multer = require("multer");
const path = require("path");
const { getManufacturerDir, ensureDirSync } = require("../src/utils/paths");

const ALLOWED = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]);
const MAX_SIZE = 3 * 1024 * 1024; // 3MB

function sanitizeBaseName(name) {
  return String(name)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-zA-Z0-9_-]+/g, "_") // mantém apenas caracteres seguros
    .replace(/_+/g, "_")
    .toLowerCase()
    .slice(0, 100);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = getManufacturerDir();
    ensureDirSync(dest);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    // Usar o nome original do arquivo, apenas sanitizado
    const originalName = file.originalname || "upload.png";
    const ext = path.extname(originalName).toLowerCase();
    const baseName = path.basename(originalName, ext);
    const sanitized = sanitizeBaseName(baseName);
    
    const finalName = `${sanitized}${ext}`;
    cb(null, finalName);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();
  if (!ALLOWED.has(ext)) {
    return cb(new Error("Extensão não permitida. Use PNG/JPG/JPEG/WEBP/GIF/SVG."));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE },
});

module.exports = { upload, ALLOWED, MAX_SIZE };

