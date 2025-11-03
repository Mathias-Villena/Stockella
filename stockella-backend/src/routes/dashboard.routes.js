const express = require("express");
const router = express.Router();
const { resumen } = require("../controllers/dashboard.controller");
const auth = require("../middlewares/auth");

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Endpoints para obtener métricas e indicadores del sistema
 */

/**
 * @swagger
 * /dashboard/resumen:
 *   get:
 *     summary: Obtiene el resumen general del inventario y usuarios
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos obtenidos correctamente
 *       401:
 *         description: Token JWT inválido o ausente
 */
router.get("/resumen", auth, resumen);

module.exports = router;
