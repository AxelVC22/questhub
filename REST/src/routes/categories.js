const express = require('express');
const jwtAuth = require('../middlewares/jwt-auth');
const router = express.Router();

const {
    getCategoryById,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} = require('../controllers/categories');
const verifyToken = require('../middlewares/jwt-auth');

/**
 * @swagger
 * /categories/{category_id}:
 *   get:
 *     summary: Obtener una categoría por su ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: category_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la categoría
 *     responses:
 *       200:
 *         description: Categoría encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Categoría no encontrada
 */
router.get('/:category_id', getCategoryById);

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Obtener todas las categorías
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Lista de categorías
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */
router.get('/', getCategories);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Crear una nueva categoría
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre de la categoría
 *               description:
 *                 type: string
 *                 description: Descripción de la categoría
 *               status:
 *                 type: string
 *                 description: Estado de la categoría (opcional)
 *     responses:
 *       201:
 *         description: Categoría creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Datos inválidos
 */
router.post('/', verifyToken, createCategory);

/**
 * @swagger
 * /categories/{category_id}:
 *   put:
 *     summary: Actualizar una categoría por ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: category_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la categoría a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nuevo nombre de la categoría
 *               description:
 *                 type: string
 *                 description: Nueva descripción de la categoría
 *               status:
 *                 type: string
 *                 description: Nuevo estado de la categoría
 *     responses:
 *       200:
 *         description: Categoría actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Nombre duplicado o datos inválidos
 *       404:
 *         description: Categoría no encontrada
 */
router.put('/:category_id', verifyToken, updateCategory);

/**
 * @swagger
 * /categories/{category_id}:
 *   delete:
 *     summary: Eliminar (desactivar) una categoría por ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: category_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la categoría a eliminar
 *     responses:
 *       200:
 *         description: Categoría eliminada (estado cambiado a Inactive)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Categoría no encontrada
 */
router.delete('/:category_id', verifyToken, deleteCategory);

module.exports = router;