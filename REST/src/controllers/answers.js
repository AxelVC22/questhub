const {request, response} = require('express');
const Answer = require('../models/answer');

const getAnswerById = async (req = request, res = response) => {
    try {
        const { answer_id } = req.params;
        const aux_answer = await Answer.findById(answer_id).populate('author');

        if (!aux_answer) {
            return res.status(404).json({
                message: "Respuesta no encontrada"
            });
        }
        return res.status(200).json(aux_answer);
    }
    catch (error) {
        console.log(error.message, error);
        res.status(500).json({
            message: 'Error al recuperar la respuesta',
            error : error.message
        });
    }
}

const createAnswer = async (req = request, res = response) => {
    try {
        const { content, author, post, parentAnswer } = req.body;

        if (!content) {
            return res.status(400).json({ message: 'El contenido de la respuesta es obligatorio' });
        }
        if (!author) {
            return res.status(400).json({ message: 'El autor de la respuesta es obligatorio' });
        }

        const newAnswer = await Answer.create({ content, author, post , parentAnswer });
        return res.status(201).json(newAnswer);
        }
    catch (error) {
        console.error(error.message);
        return res.status(500).json({
            message: 'Error al crear la respuesta',
            error: error.message,
        });
    }
}

const updateAnswer = async (req = request, res = response) => {
    try {
    const { answer_id } = req.params;
    const { content, status } = req.body;

    if (!content) {
        return res.status(400).json({ message: 'El contenido de la respuesta es obligatorio' });
    }

    const updatedAnswer = await Answer.findByIdAndUpdate(
        answer_id,
        { content },
        { new: true }
    );

    if (!updatedAnswer) {
        return res.status(404).json({ message: 'Respuesta no encontrada' });
    }

    return res.status(200).json(updatedAnswer);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'Error al actualizar la respuesta',
            error: error.message,
        });
    }
}

const deleteAnswer = async (req = request, res = response) => {
    try {
        const { answer_id } = req.params;

        const deletedAnswer = await Answer.findByIdAndUpdate(answer_id, { status: 'Inactive' }, { new: true });

        if (!deletedAnswer) {
            return res.status(404).json({ message: 'Respuesta no encontrada' });
        }

        return res.status(200).json({ message: 'Respuesta eliminada correctamente' });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'Error al eliminar la respuesta',
            error: error.message,
        });
    }
}

const getAnswersByPostId = async (req = request, res = response) => {
    try {
        const { post_id } = req.params;
        const answers = await Answer.find({ post: post_id }).populate('post').populate('author');

        if (!answers || answers.length === 0) {
            return res.status(404).json({
                message: "No hay respuestas para esta publicación"
            });
        }
        return res.status(200).json(answers);
    }
    catch (error) {
        console.log(error.message, error);
        res.status(500).json({
            message: 'Error al recuperar las respuestas',
            error : error.message
        });
    }
}

const getAnswersByAnswerId = async (req = request, res = response) => {
    try {
        const { answer_id } = req.params;
        const answers = await Answer.find({parentAnswer: answer_id}).populate('author');

        if (!answers || answers.length === 0) {
            return res.status(404).json({
                message: "Respuesta no encontrada"
            });
        }

        return res.status(200).json(answers);

        } catch (error) {
        console.log(error.message, error);
        res.status(500).json({
            message: 'Error al recuperar las respuestas',
            error : error.message
        }
        );
    }
}

module.exports = {
    getAnswerById,
    createAnswer,
    updateAnswer,
    deleteAnswer,
    getAnswersByPostId,
    getAnswersByAnswerId
}