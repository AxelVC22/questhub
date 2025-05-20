const express = require('express');
const jwtAuth = require('../middlewares/jwt-auth');
const router = express.Router();

const {
    createRating,
    updateRating,
   getRatingById,
    getRatingsByAnswerId,
} = require('../controllers/ratings');

/**
 * @swagger
 * /ratings/{rating_id}:
 *   get:
 *     summary: Obtener una calificación por ID
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: rating_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la calificación
 *     responses:
 *       200:
 *         description: Calificación encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rating'
 *       404:
 *         description: Calificación no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:rating_id', getRatingById);

/**
 * @swagger
 * /ratings/answer/{answer_id}:
 *   get:
 *     summary: Obtener calificaciones por ID de respuesta
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: answer_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la respuesta asociada
 *     responses:
 *       200:
 *         description: Lista de calificaciones para una respuesta
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Rating'
 *       500:
 *         description: Error del servidor
 */
router.get('/answer/:answer_id', getRatingsByAnswerId);

/**
 * @swagger
 * /ratings:
 *   post:
 *     summary: Crear una nueva calificación
 *     tags: [Ratings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - qualification
 *               - author
 *               - answer
 *             properties:
 *               qualification:
 *                 type: number
 *                 description: Valor de la calificación
 *               author:
 *                 type: string
 *                 description: ID del autor
 *               answer:
 *                 type: string
 *                 description: ID de la respuesta evaluada
 *     responses:
 *       201:
 *         description: Calificación creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rating'
 *       400:
 *         description: Datos requeridos faltantes
 *       500:
 *         description: Error del servidor
 */
router.post('/', createRating);

/**
 * @swagger
 * /ratings/{rating_id}:
 *   put:
 *     summary: Actualizar una calificación
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: rating_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la calificación a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - qualification
 *             properties:
 *               qualification:
 *                 type: number
 *                 description: Nuevo valor de calificación
 *     responses:
 *       200:
 *         description: Calificación actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rating'
 *       400:
 *         description: Valor de calificación no proporcionado
 *       404:
 *         description: Calificación no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put('/:rating_id', updateRating);

module.exports = router;

