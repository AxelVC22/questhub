const {request , response} = require('express');
const Report = require('../models/report');

const getReportById = async (req = request, res = response) => {
    try {
        const { report_id } = req.params;

        const aux_report = await Report.findById(report_id)
            .populate('reporter', 'name')
            .populate({
                path: 'post',
                populate: {
                  path: 'author',
                  select: 'name'
                }
            })
            .populate({
                path: 'answer',
                populate: {
                  path: 'author',
                  select: 'name'
                }
            });

        if (!aux_report) {
            return res.status(404).json({
                message: "Reporte no encontrado"
            });
        }
        return res.status(200).json(aux_report);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: 'Error al recuperar el reporte',
            error : error.message
        });
    }
}

const getReports = async (req = request, res = response) => {
    try {
    let { page = 1, limit = 10 } = req.query;

    page = Math.max(Number(page), 1);
    limit = Math.max(Number(limit), 1);
    const totalReports = await Report.countDocuments();
    const totalPages = Math.ceil(totalReports / limit);

    const reports = await Report.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate('reporter', 'name')
         .populate('reporter', 'name')
                    .populate({
                        path: 'post',
                        populate: {
                          path: 'author',
                          select: 'name'
                        }
                    })
                    .populate({
                        path: 'answer',
                        populate: {
                          path: 'author',
                          select: 'name'
                        }
                    });

        res.status(200).json({
            currentPage: page,
            totalPages,
            totalReports,
            reports
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: 'Error al recuperar los reportes',
            error : error.message
        });
    }
}


const createReport = async (req = request, res = response) => {
    try {
        const { reason, post, answer, reporter } = req.body;

        if (!reason || !reporter) {
            return res.status(400).json({
                message: 'La razon y el reportador son obligatorios'
            });
        }

        const newReport = await Report.create({ reason, reporter, ...(answer ? { answer } : { post }) });

        return res.status(201).json(newReport);

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: 'Error al crear el reporte',
            error : error.message
        });
    }
}

const updateReport = async (req = request, res = response) => {
    try {
        const { report_id } = req.params;
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({
                message: 'El estado es obligatorio'
            });
        }
        const updatedReport = await Report.findByIdAndUpdate
            (report_id, { status }, { new: true });
        if (!updatedReport) {
            return res.status(404).json({
                message: "Reporte no encontrado"
            });
        }
           return res.status(200).json(updatedReport);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: 'Error al actualizar el reporte',
            error : error.message
        });
    }
}

module.exports = { getReportById, getReports, createReport, updateReport };