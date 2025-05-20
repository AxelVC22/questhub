const {request, response} = require('express');
const Rating = require('../models/rating');

const getRatingById = async (req = request, res = response) => {
    try {
        const { rating_id } = req.params;
        console.log('ID recibido:', rating_id);
        const aux_rating = await Rating.findById(rating_id).populate('author', 'name');
        if (!aux_rating) {
            return res.status(404).json({
                message: "Calificación no encontrada"
            });
        }
        return res.status(200).json(aux_rating);
    }
    catch (error) {
        console.error(error.message, error);
        res.status(500).json({
            message: 'Error al recuperar la calificación',
            error : error.message
        });
    }
}


const createRating = async (req = request, res = response) => {
    try {
        const { qualification, author, answer } = req.body;

        if (!qualification) {
            return res.status(400).json({ message: 'El valor de la calificación es obligatorio' });
        }

        if (!author) {
            return res.status(400).json({ message: 'El autor de la calificación es obligatorio' });
        }

        if (!answer) {
            return res.status(400).json({ message: 'La calificación debe estar asociada a una respuesta' });
        }

        const newRating = await Rating.create({
            qualification,
            author,
            answer
        });

        return res.status(201).json(newRating);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            message: 'Error al crear la calificación',
            error: error.message,
        });
    }
}

const getRatingsByAnswerId = async (req = request, res = response) => {
    try {
        const { answer_id } = req.params;

        const ratings = await Rating.find({ answer: answer_id }).populate('author', 'name');

        return res.status(200).json(ratings);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: 'Error al recuperar las calificaciones',
            error : error.message
        });
    }
}

const updateRating = async (req = request, res = response) => {
    try {
        const { rating_id } = req.params;
        const { qualification } = req.body;

        if (!qualification) {
            return res.status(400).json({ message: 'El valor de la calificación es obligatorio' });
        }

        const updatedRating = await Rating.findByIdAndUpdate(rating_id, { qualification }, { new: true });

        if (!updatedRating) {
            return res.status(404).json({ message: 'Calificación no encontrada' });
        }

        return res.status(200).json(updatedRating);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            message: 'Error al actualizar la calificación',
            error: error.message,
        });
    }
}

module.exports = { getRatingById, createRating, getRatingsByAnswerId, updateRating };