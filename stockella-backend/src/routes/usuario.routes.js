/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Endpoints para la gestión de usuarios del sistema
 */

const router = require("express").Router();
const auth = require("../middlewares/auth");
const role = require("../middlewares/role"); // ✅ añadimos el control por rol
const ctrl = require("../controllers/usuario.controller");

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Lista usuarios con filtros y paginación
 *     description: Devuelve los usuarios del sistema con búsqueda por nombre o correo, y soporte de paginación.  
 *       Solo accesible para el **Administrador**.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Texto de búsqueda (nombre o correo electrónico)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página a mostrar
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de usuarios por página
 *     responses:
 *       200:
 *         description: Lista paginada de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 45
 *                 paginas:
 *                   type: integer
 *                   example: 5
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_usuario:
 *                         type: integer
 *                         example: 1
 *                       nombre:
 *                         type: string
 *                         example: "Administrador General"
 *                       email:
 *                         type: string
 *                         example: "admin@stockella.com"
 *                       estado:
 *                         type: boolean
 *                         example: true
 *                       Rol:
 *                         type: object
 *                         properties:
 *                           nombre:
 *                             type: string
 *                             example: "Administrador"
 */
router.get("/", auth, role("Administrador"), ctrl.listar);

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Crea un nuevo usuario
 *     description: Solo el **Administrador** puede crear nuevos usuarios.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - password
 *               - id_rol
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Angela Lopez"
 *               email:
 *                 type: string
 *                 example: "angela@stockella.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *               id_rol:
 *                 type: integer
 *                 example: 2
 *               estado:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 */
router.post("/", auth, role("Administrador"), ctrl.crear);

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Actualiza un usuario existente
 *     description: Solo el **Administrador** puede modificar usuarios.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Angela Lopez Romero"
 *               email:
 *                 type: string
 *                 example: "angela@stockella.com"
 *               password:
 *                 type: string
 *                 example: "nueva123"
 *               estado:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 */
router.put("/:id", auth, role("Administrador"), ctrl.actualizar);

/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     summary: Elimina un usuario
 *     description: Solo el **Administrador** puede eliminar usuarios.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a eliminar
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 */
router.delete("/:id", auth, role("Administrador"), ctrl.eliminar);

module.exports = router;
