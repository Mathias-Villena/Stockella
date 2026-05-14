const router = require("express").Router();
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const upload = require("../middlewares/upload");

const {
  subirImagenProducto,
  subirImagenDataset,
  subirEvidenciaMovil,
} = require("../controllers/upload.controller");

router.post(
  "/producto",
  auth,
  role("Administrador", "Editor"),
  upload.single("file"),
  subirImagenProducto
);

router.post(
  "/dataset",
  auth,
  role("Administrador", "Editor"),
  upload.single("file"),
  subirImagenDataset
);

router.post(
  "/evidencia",
  auth,
  role("Administrador", "Editor", "Empleado"),
  upload.single("file"),
  subirEvidenciaMovil
);

module.exports = router;