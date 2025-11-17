const router = require("express").Router();
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const ctrl = require("../controllers/reporte.controller");

/**
 * @swagger
 * tags:
 *   name: Reportes
 *   description: Generación y descarga de reportes del sistema
 */

/**
 * @swagger
 * /reportes:
 *   get:
 *     summary: Lista el historial de reportes generados
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *         description: Tipo de reporte
 *       - in: query
 *         name: formato
 *         schema:
 *           type: string
 *           enum: [PDF, Excel]
 *       - in: query
 *         name: fecha
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Lista de reportes generados
 */
router.get("/", auth, role("Administrador", "Editor"), ctrl.listar);

/**
 * @swagger
 * /reportes/generar:
 *   post:
 *     summary: Genera un reporte PDF o Excel
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipo
 *               - formato
 *               - periodo
 *             properties:
 *               tipo:
 *                 type: string
 *                 example: Inventario General
 *               formato:
 *                 type: string
 *                 enum: [PDF, Excel]
 *                 example: PDF
 *               periodo:
 *                 type: string
 *                 example: "Este mes"
 *     responses:
 *       201:
 *         description: Reporte generado correctamente
 */
router.post("/generar", auth, role("Administrador", "Editor"), ctrl.generar);

/**
 * @swagger
 * /reportes/{id}/descargar:
 *   get:
 *     summary: Descarga un archivo de reporte generado
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Archivo descargado correctamente
 */
router.get("/:id/descargar", auth, role("Administrador", "Editor"), ctrl.descargar);

module.exports = router;
