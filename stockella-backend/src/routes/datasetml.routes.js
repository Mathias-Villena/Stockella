const router = require("express").Router();
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const { listar, eliminar } = require("../controllers/datasetml.controller");

router.get("/", auth, role("Administrador", "Editor"), listar);
router.delete("/:id", auth, role("Administrador"), eliminar);

module.exports = router;
