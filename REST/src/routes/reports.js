const express = require('express');
const jwtAuth = require('../middlewares/jwt-auth');
const router = express.Router();

const {
    getReportById,
    getReports,
    createReport,
    updateReport
} = require('../controllers/reports');

/**
 * @swagger
 * /reports/{report_id}:
 *   get:
 *     summary: Obtener un reporte por ID
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: report_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del reporte
 *     responses:
 *       200:
 *         description: Reporte encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       404:
 *         description: Reporte no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:report_id', getReportById);

/**
 * @swagger
 * /reports:
 *   get:
 *     summary: Obtener todos los reportes
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Página actual (default = 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Límite de reportes por página (default = 10)
 *     responses:
 *       200:
 *         description: Lista de reportes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalReports:
 *                   type: integer
 *                 reports:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Report'
 *       500:
 *         description: Error del servidor
 */
router.get('/', getReports);

/**
 * @swagger
 * /reports:
 *   post:
 *     summary: Crear un nuevo reporte
 *     tags: [Reports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *               - reporter
 *             properties:
 *               reason:
 *                 type: string
 *               reporter:
 *                 type: string
 *               post:
 *                 type: string
 *               answer:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reporte creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       400:
 *         description: Campos obligatorios faltantes
 *       500:
 *         description: Error del servidor
 */
router.post('/', createReport);

/**
 * @swagger
 * /reports/{report_id}:
 *   put:
 *     summary: Actualizar estado de un reporte
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: report_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del reporte
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reporte actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       400:
 *         description: Estado no proporcionado
 *       404:
 *         description: Reporte no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/:report_id', updateReport);

module.exports = router;


