const router = require("express").Router();
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const { listar, eliminar } = require("../controllers/datasetml.controller");

/**
 * @swagger
 * tags:
 *   name: Dataset ML
 *   description: Gestión del dataset de imágenes para el modelo de Machine Learning
 */

/**
 * @swagger
 * /dataset:
 *   get:
 *     summary: Lista el dataset de imágenes usadas para el modelo ML
 *     description: 
 *       Retorna imágenes registradas como dataset, con soporte de búsqueda, paginación y filtro por producto.  
 *       Acceso permitido para **Administrador** y **Editor**.
 *     tags: [Dataset ML]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Buscar por etiqueta (texto)
 *         example: "cola"
 *       - in: query
 *         name: producto
 *         schema:
 *           type: integer
 *         description: ID del producto asociado
 *         example: 12
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
 *           default: 12
 *         description: Número de registros por página
 *     responses:
 *       200:
 *         description: Dataset ML obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 85
 *                 paginas:
 *                   type: integer
 *                   example: 8
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 12
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_dataset:
 *                         type: integer
 *                         example: 10
 *                       id_producto:
 *                         type: integer
 *                         example: 12
 *                       producto:
 *                         type: string
 *                         example: "Inca Kola 500ml"
 *                       imagen_url:
 *                         type: string
 *                         example: "https://stockella-dev.s3.us-east-1.amazonaws.com/products/12/main_123abc.jpg"
 *                       etiqueta:
 *                         type: string
 *                         example: "12"
 *                       fuente:
 *                         type: string
 *                         example: "Admin"
 */
router.get("/", auth, role("Administrador", "Editor"), listar);

/**
 * @swagger
 * /dataset/{id}:
 *   delete:
 *     summary: Elimina una imagen del dataset ML
 *     description: Solo el **Administrador** puede eliminar registros del dataset ML.
 *     tags: [Dataset ML]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del dataset a eliminar
 *         example: 10
 *     responses:
 *       200:
 *         description: Imagen eliminada correctamente del dataset ML
 *       404:
 *         description: El registro no existe
 */
router.delete("/:id", auth, role("Administrador"), eliminar);

module.exports = router;
