const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const controller = require("../controllers/categoria.controller");

// GET /api/categorias
router.get(
  "/",
  auth,
  role("Administrador", "Editor", "Visualizador", "Empleado"),
  controller.listar
);

// POST /api/categorias
router.post(
  "/",
  auth,
  role("Administrador", "Editor"),
  controller.crear
);

// PUT /api/categorias/:id
router.put(
  "/:id",
  auth,
  role("Administrador", "Editor"),
  controller.actualizar
);

// DELETE /api/categorias/:id
router.delete(
  "/:id",
  auth,
  role("Administrador"),
  controller.eliminar
);

module.exports = router;