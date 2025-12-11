const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const { listar, crear } = require("../controllers/movimiento.controller");

/**
 * @swagger
 * tags:
 *   name: Movimientos
 *   description: Registro y consulta de movimientos del inventario
 */

/**
 * @swagger
 * /movimientos:
 *   get:
 *     summary: Lista los movimientos registrados con filtros opcionales
 *     description: Permite filtrar los movimientos por tipo, producto o rango de fechas.  
 *       Disponible para los roles **Administrador**, **Editor**, **Visualizador** y **Empleado**.
 *     tags: [Movimientos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [Entrada, Salida]
 *         description: Tipo de movimiento
 *       - in: query
 *         name: producto
 *         schema:
 *           type: integer
 *         description: ID del producto
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha inicial del rango
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha final del rango
 *     responses:
 *       200:
 *         description: Lista de movimientos obtenida correctamente
 */
router.get("/", auth, role("Administrador", "Editor", "Visualizador", "Empleado"), listar);

/**
 * @swagger
 * /movimientos:
 *   post:
 *     summary: Registra un nuevo movimiento de inventario
 *     description: Crea un nuevo movimiento (Entrada o Salida) y actualiza el stock.  
 *       Solo accesible por **Administrador**, **Editor** o **Empleado**.
 *     tags: [Movimientos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_producto
 *               - tipo
 *               - cantidad
 *             properties:
 *               id_producto:
 *                 type: integer
 *                 example: 12
 *               tipo:
 *                 type: string
 *                 enum: [Entrada, Salida]
 *                 example: Entrada
 *               cantidad:
 *                 type: integer
 *                 example: 25
 *               motivo:
 *                 type: string
 *                 example: Reposición de stock
 *               evidencia_url:
 *                 type: string
 *                 example: https://stockella-dev.s3.us-east-1.amazonaws.com/evidencias/entrada_123.jpg
 *     responses:
 *       201:
 *         description: Movimiento creado correctamente
 */
router.post("/", auth, role("Administrador", "Editor", "Empleado"), crear);

module.exports = router;

