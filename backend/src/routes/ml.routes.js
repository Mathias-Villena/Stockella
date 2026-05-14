const router = require("express").Router();
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const ctrl = require("../controllers/ml.controller");

router.post(
  "/predict",
  auth,
  role("Administrador", "Editor", "Empleado"),
  ctrl.predict
);

module.exports = router;