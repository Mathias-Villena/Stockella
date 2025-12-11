const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const { listar, marcarAtendida } = require("../controllers/alerta.controller");

/**
 * @swagger
 * tags:
 *   name: Alertas
 *   description: Gestión de alertas del sistema
 */

/**
 * @swagger
 * /alertas:
 *   get:
 *     summary: Lista todas las alertas del sistema
 *     description: Muestra las alertas activas o atendidas del inventario.  
 *       Disponible para **Administrador**, **Editor** y **Visualizador**.
 *     tags: [Alertas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           example: Stock Bajo
 *         description: Filtra por tipo de alerta
 *       - in: query
 *         name: atendida
 *         schema:
 *           type: boolean
 *           example: false
 *         description: Filtra si la alerta está atendida o no
 *     responses:
 *       200:
 *         description: Lista de alertas obtenida correctamente
 */
router.get("/", auth, role("Administrador", "Editor", "Visualizador"), listar);

/**
 * @swagger
 * /alertas/{id}/atender:
 *   put:
 *     summary: Marca una alerta como atendida
 *     description: Solo el **Administrador** puede marcar una alerta como atendida.
 *     tags: [Alertas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la alerta a marcar como atendida
 *     responses:
 *       200:
 *         description: Alerta marcada como atendida correctamente
 */
router.put("/:id/atender", auth, role("Administrador"), marcarAtendida);

module.exports = router;
