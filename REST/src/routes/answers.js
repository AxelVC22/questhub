const express = require('express');
const jwtAuth = require('../middlewares/jwt-auth');
const router = express.Router();

const {
    getAnswerById,
    createAnswer,
    updateAnswer,
    deleteAnswer,
    getAnswersByPostId,
    getAnswersByAnswerId,
} = require('../controllers/answers');

/**
 * @swagger
 * /answers/{answer_id}:
 *   get:
 *     summary: Obtener una respuesta por su ID
 *     tags: [Answers]
 *     parameters:
 *       - in: path
 *         name: answer_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la respuesta a obtener
 *     responses:
 *       200:
 *         description: Respuesta encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Answer'
 *       404:
 *         description: Respuesta no encontrada
 *       500:
 *         description: Error al recuperar la respuesta
 */
router.get('/:answer_id', getAnswerById);

/**
 * @swagger
 * /answers/post/{post_id}:
 *   get:
 *     summary: Obtener todas las respuestas asociadas a un post
 *     tags: [Answers]
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del post para obtener respuestas
 *     responses:
 *       200:
 *         description: Lista de respuestas del post
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Answer'
 *       404:
 *         description: No hay respuestas para esta publicación
 *       500:
 *         description: Error al recuperar las respuestas
 */
router.get('/post/:post_id', getAnswersByPostId);

/**
 * @swagger
 * /answers/answer/{answer_id}:
 *   get:
 *     summary: Obtener respuestas hijas asociadas a una respuesta (sub-respuestas)
 *     tags: [Answers]
 *     parameters:
 *       - in: path
 *         name: answer_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la respuesta padre
 *     responses:
 *       200:
 *         description: Lista de respuestas hijas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Answer'
 *       404:
 *         description: Respuesta no encontrada
 *       500:
 *         description: Error al recuperar las respuestas
 */
router.get('/answer/:answer_id', getAnswersByAnswerId);

/**
 * @swagger
 * /answers:
 *   post:
 *     summary: Crear una nueva respuesta
 *     tags: [Answers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - author
 *             properties:
 *               content:
 *                 type: string
 *                 description: Contenido de la respuesta
 *               author:
 *                 type: string
 *                 description: ID del autor de la respuesta
 *               post:
 *                 type: string
 *                 description: ID del post al que pertenece la respuesta
 *               parentAnswer:
 *                 type: string
 *                 description: ID de la respuesta padre (si es una sub-respuesta)
 *     responses:
 *       201:
 *         description: Respuesta creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Answer'
 *       400:
 *         description: Contenido o autor faltantes
 *       500:
 *         description: Error al crear la respuesta
 */
router.post('/', createAnswer);

/**
 * @swagger
 * /answers/{answer_id}:
 *   put:
 *     summary: Actualizar una respuesta por ID
 *     tags: [Answers]
 *     parameters:
 *       - in: path
 *         name: answer_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la respuesta a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Nuevo contenido para la respuesta
 *               status:
 *                 type: string
 *                 description: Estado de la respuesta (opcional)
 *     responses:
 *       200:
 *         description: Respuesta actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Answer'
 *       400:
 *         description: Contenido de la respuesta obligatorio
 *       404:
 *         description: Respuesta no encontrada
 *       500:
 *         description: Error al actualizar la respuesta
 */
router.put('/:answer_id', updateAnswer);

/**
 * @swagger
 * /answers/{answer_id}:
 *   patch:
 *     summary: Eliminar (desactivar) una respuesta por ID
 *     tags: [Answers]
 *     parameters:
 *       - in: path
 *         name: answer_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la respuesta a eliminar
 *     responses:
 *       200:
 *         description: Respuesta eliminada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Respuesta no encontrada
 *       500:
 *         description: Error al eliminar la respuesta
 */
router.patch('/:answer_id', deleteAnswer);


module.exports = router;
