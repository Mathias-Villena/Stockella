/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: Endpoints para gestión de productos e inventario
 */

const router = require("express").Router();
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const ctrl = require("../controllers/producto.controller");

/**
 * @swagger
 * /productos:
 *   get:
 *     summary: Lista productos con filtros y paginación
 *     description: Devuelve los productos con soporte de búsqueda, categoría y paginación.
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Texto de búsqueda (nombre del producto)
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: integer
 *         description: ID de la categoría
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 9
 *         description: Cantidad de registros por página
 *     responses:
 *       200:
 *         description: Lista de productos paginada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 120
 *                 paginas:
 *                   type: integer
 *                   example: 13
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 9
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_producto:
 *                         type: integer
 *                         example: 1
 *                       nombre:
 *                         type: string
 *                         example: Inca Kola 500ml
 *                       precio:
 *                         type: number
 *                         example: 3.5
 *                       stock_actual:
 *                         type: integer
 *                         example: 100
 *                       imagen_principal:
 *                         type: string
 *                         example: https://stockella-dev.s3.us-east-1.amazonaws.com/products/1/main_123.jpg
 */
router.get("/", auth, role("Administrador", "Editor", "Visualizador", "Empleado"), ctrl.listar);

/**
 * @swagger
 * /productos:
 *   post:
 *     summary: Crea un nuevo producto
 *     description: Solo los roles **Administrador** y **Editor** pueden crear productos.
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               codigo:
 *                 type: string
 *                 example: INK-500
 *               nombre:
 *                 type: string
 *                 example: Inca Kola 500ml
 *               descripcion:
 *                 type: string
 *                 example: Gaseosa amarilla peruana 500ml
 *               precio:
 *                 type: number
 *                 example: 3.50
 *               stock_actual:
 *                 type: number
 *                 example: 120
 *               stock_minimo:
 *                 type: number
 *                 example: 10
 *               unidad_medida:
 *                 type: string
 *                 example: unidad
 *               id_categoria:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Producto creado correctamente
 */
router.post("/", auth, role("Administrador", "Editor"), ctrl.crear);

/**
 * @swagger
 * /productos/{id}:
 *   put:
 *     summary: Actualiza un producto existente
 *     description: Solo los roles **Administrador** y **Editor** pueden actualizar productos.
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               nombre: Inca Kola 500ml retornable
 *               precio: 3.20
 *     responses:
 *       200:
 *         description: Producto actualizado correctamente
 */
router.put("/:id", auth, role("Administrador", "Editor"), ctrl.actualizar);

/**
 * @swagger
 * /productos/{id}:
 *   delete:
 *     summary: Elimina un producto
 *     description: Solo el rol **Administrador** puede eliminar productos.
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto eliminado correctamente
 */
router.delete("/:id", auth, role("Administrador"), ctrl.eliminar);

module.exports = router;
