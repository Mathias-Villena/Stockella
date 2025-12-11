const express = require('express');
const router = express.Router();
const auditoriaController = require('../controllers/auditoria.controller');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

/**
 * @swagger
 * tags:
 *   name: Auditoría
 *   description: Registro y monitoreo de acciones del sistema
 */

/**
 * @swagger
 * /auditoria:
 *   get:
 *     summary: Lista todas las acciones registradas en el sistema
 *     description: Solo accesible para el **Administrador**.
 *     tags: [Auditoría]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: usuario
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de usuario
 *       - in: query
 *         name: accion
 *         schema:
 *           type: string
 *           enum: [CREAR, ACTUALIZAR, CONFIGURACION]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar en el detalle de auditoría
 *     responses:
 *       200:
 *         description: Auditoría obtenida correctamente
 */
router.get("/", auth, role("Administrador"), auditoriaController.obtenerAuditoria);

/**
 * @swagger
 * /auditoria/resumen:
 *   get:
 *     summary: Obtiene métricas generales de la auditoría
 *     description: Solo accesible para el **Administrador**.
 *     tags: [Auditoría]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumen obtenido correctamente
 */
router.get("/resumen", auth, role("Administrador"), auditoriaController.obtenerResumen);

module.exports = router;
