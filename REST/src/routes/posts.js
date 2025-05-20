const express = require('express');
const jwtAuth = require('../middlewares/jwt-auth');
const upload = require('../middlewares/upload-multimedia');
const router = express.Router();

const {
    getPostById,
    getPostsByUserId,
    getPosts,
    createPost,
    updatePost,
    deletePost
} = require('../controllers/posts');

/**
 * @swagger
 * /posts/{post_id}:
 *   get:
 *     summary: Obtener una publicación por su ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: post_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la publicación
 *     responses:
 *       200:
 *         description: Publicación encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Publicación no encontrada
 */
router.get('/:post_id', getPostById);

/**
 * @swagger
 * /posts/user/{user_id}:
 *   get:
 *     summary: Obtener todas las publicaciones de un usuario
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario autor
 *     responses:
 *       200:
 *         description: Lista de publicaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 */
router.get('/user/:user_id', getPostsByUserId);

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Obtener publicaciones paginadas
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página (por defecto 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Cantidad de publicaciones por página (por defecto 10)
 *     responses:
 *       200:
 *         description: Lista paginada de publicaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalPosts:
 *                   type: integer
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 */
router.get('/', getPosts);

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Crear una nueva publicación
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - author
 *               - categories
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               author:
 *                 type: string
 *                 description: ID del autor
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lista de IDs de categorías
 *     responses:
 *       201:
 *         description: Publicación creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Datos inválidos
 */
router.post('/',createPost);

/**
 * @swagger
 * /posts/{post_id}:
 *   put:
 *     summary: Actualizar una publicación por ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: post_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la publicación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               multimedia:
 *                 type: string
 *                 description: URL o referencia multimedia
 *     responses:
 *       200:
 *         description: Publicación actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Publicación no encontrada
 */
router.put('/:post_id', updatePost);

/**
 * @swagger
 * /posts/{post_id}:
 *   delete:
 *     summary: Eliminar (desactivar) una publicación por ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: post_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la publicación
 *     responses:
 *       200:
 *         description: Publicación eliminada correctamente
 *       404:
 *         description: Publicación no encontrada
 */
router.delete('/:post_id', deletePost);

module.exports = router;

