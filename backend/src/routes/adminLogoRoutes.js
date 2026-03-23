const express = require("express");
const { listarLogos, uploadLogo } = require("../controllers/adminLogoController");
const { upload } = require("../../middleware/uploadLogo");

const router = express.Router();

router.get("/logos", listarLogos);

router.post("/upload/logo", upload.single("file"), uploadLogo);

module.exports = router;
