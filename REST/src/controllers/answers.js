const { request, response } = require('express');
const Answer = require('../models/answer');
const Post = require('../models/post');
const UserFollower = require('../models/userFollower')

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
            error: error.message
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

        const newAnswer = await Answer.create({ content, author, post, parentAnswer });

        await Post.findByIdAndUpdate(
            post,
            { $inc: { totalAnswers: 1 } }
        );


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
        console.log("error aqui: " + error.message);
        res.status(500).json({
            message: 'Error al eliminar la respuesta',
            error: error.message,
        });
    }
}

const getAnswersByPostId = async (req = request, res = response) => {
    try {
        let { page = 1, limit = 10, user } = req.query;

        const { post_id } = req.params;

        page = Math.max(Number(page), 1);
        limit = Math.max(Number(limit), 1);

        const totalAnswers = await Answer.countDocuments({ post: post_id });
        const totalPages = Math.ceil(totalAnswers / limit);

        const answers = await Answer.find({ post: post_id, status: 'Active' }).skip((page - 1) * limit)
            .limit(limit)
            .sort({ qualification: -1, createdAt: -1 }).populate('post', '_id').populate('author', 'name');



        if (!answers.length) {
            return res.status(200).json({
                currentPage: page,
                totalPages,
                totalAnswers,
                answers: []
            });
        }

        const authorIds = answers
            .filter(answer => answer.author)
            .map(answer => answer.author._id.toString());


        const uniqueAuthorIds = [...new Set(authorIds)];

        let followedIds = new Set();


        if (user && uniqueAuthorIds.length > 0) {
            const follows = await UserFollower.find({
                follower: user,
                user: { $in: uniqueAuthorIds }
            });

            followedIds = new Set(follows.map(f => f.user.toString()));
        }

        const answersWithFollowInfo = answers.map(answer => {
            const a = answer.toObject();

            if (a.author) {
                a.author.isFollowed = user
                    ? followedIds.has(answer.author._id.toString())
                    : false;
            }

            return a;
        });

        return res.status(200).json({
            currentPage: page,
            totalPages,
            totalAnswers,
            answers: answersWithFollowInfo
        });
    }
    catch (error) {
        console.log(error.message, error);
        res.status(500).json({
            message: 'Error al recuperar las respuestas',
            error: error.message
        });
    }
}

const getAnswersByAnswerId = async (req = request, res = response) => {
    try {
        let { page = 1, limit = 10 } = req.query;
        const { answer_id } = req.params;


        page = Math.max(Number(page), 1);
        limit = Math.max(Number(limit), 1);

        const totalAnswers = await Answer.countDocuments({ parentAnswer: answer_id });
        const totalPages = Math.ceil(totalAnswers / limit);

        const answers = await Answer.find({ parentAnswer: answer_id }).skip((page - 1) * limit)
            .limit(limit)
            .sort({ qualification: -1, createdAt: -1 }).populate('author', 'name');


        return res.status(200).json({
            currentPage: page,
            totalPages,
            totalAnswers,
            answers
        });
    }
    catch (error) {
        console.log(error.message, error);
        res.status(500).json({
            message: 'Error al recuperar las respuestas',
            error: error.message
        });
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