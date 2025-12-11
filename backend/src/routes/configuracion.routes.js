const router = require("express").Router();
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const ctrl = require("../controllers/configuracion.controller");

// 🔹 Listar parámetros
router.get("/", auth, role("Administrador"), ctrl.listar);

// 🔹 Crear parámetro
router.post("/", auth, role("Administrador"), ctrl.crear);

// 🔹 Actualizar parámetro
router.put("/:id", auth, role("Administrador"), ctrl.actualizar);

// 🔹 Eliminar parámetro
router.delete("/:id", auth, role("Administrador"), ctrl.eliminar);

module.exports = router;
