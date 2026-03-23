const fs = require("fs");
const path = require("path");
const { getManufacturerDir, ensureDirSync } = require("../utils/paths");

function isImageName(name) {
  return /\.(png|jpe?g|webp|gif|svg)$/i.test(name);
}

async function listarLogos(req, res) {
  try {
    const dir = getManufacturerDir();
    ensureDirSync(dir);

    const files = fs.readdirSync(dir)
      .filter((f) => isImageName(f))
      .sort((a, b) => a.localeCompare(b));

    res.json({ ok: true, data: files });
  } catch (e) {
    console.error("listarLogos:", e);
    res.status(500).json({ ok: false, error: "Falha ao listar logos." });
  }
}

async function uploadLogo(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, error: "Nenhum arquivo enviado." });
    }
    const filename = req.file.filename;
    const publicUrl = path.posix.join("/images/manufacturer/", filename);

    res.status(201).json({
      ok: true,
      filename,
      url: publicUrl,
      message: "Logo enviada com sucesso.",
    });
  } catch (e) {
    console.error("uploadLogo:", e);
    res.status(500).json({ ok: false, error: "Falha no upload." });
  }
}

module.exports = { listarLogos, uploadLogo };
