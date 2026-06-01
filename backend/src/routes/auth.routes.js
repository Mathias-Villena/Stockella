const router = require("express").Router();

const auth = require("../middlewares/auth");

const {
  login,
  me,
  actualizarPerfil,
  cambiarPassword,
} = require("../controllers/auth.controller");

router.post("/login", login);

router.get("/me", auth, me);

router.put("/perfil", auth, actualizarPerfil);

router.put("/cambiar-password", auth, cambiarPassword);

module.exports = router;
