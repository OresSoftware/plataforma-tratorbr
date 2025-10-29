// backend/src/routes/adminLogoRoutes.js
const express = require("express");
const { listarLogos, uploadLogo } = require("../controllers/adminLogoController");
const { upload } = require("../../middleware/uploadLogo");

const router = express.Router();

// lista todos os arquivos de /frontend/public/images/manufacturer
router.get("/logos", listarLogos);

// upload (multipart/form-data) campo "file"
router.post("/upload/logo", upload.single("file"), uploadLogo);

module.exports = router;
