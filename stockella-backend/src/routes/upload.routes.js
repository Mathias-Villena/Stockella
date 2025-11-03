const router = require("express").Router();
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const upload = require("../middlewares/upload");
const { subirImagenProducto } = require("../controllers/upload.controller");

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: Subida de imágenes y archivos al bucket S3 de AWS
 */

/**
 * @swagger
 * /upload/producto:
 *   post:
 *     summary: Sube imagen de producto a S3 y registra la URL en la base de datos
 *     description: Solo los roles **Administrador** y **Editor** pueden subir imágenes de productos.
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - id_producto
 *               - file
 *             properties:
 *               id_producto:
 *                 type: integer
 *                 example: 1
 *               comoDataset:
 *                 type: string
 *                 enum: ["true", "false"]
 *                 example: "true"
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Imagen subida correctamente y registrada en la base de datos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   example: https://stockella-dev.s3.us-east-1.amazonaws.com/products/1/main_1730132791.jpg
 *                 key:
 *                   type: string
 *                   example: products/1/main_1730132791.jpg
 *       401:
 *         description: Token JWT inválido o ausente
 *       403:
 *         description: Acceso denegado. Solo Administradores o Editores.
 */
router.post(
  "/producto",
  auth,
  role("Administrador", "Editor"),
  upload.single("file"),
  subirImagenProducto
);

module.exports = router;
