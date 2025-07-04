const request = require('supertest');
const express = require('express');
const { getAnswerById } = require('../../src/controllers/answers');
const { createAnswer } = require('../../src/controllers/answers');
const { updateAnswer } = require('../../src/controllers/answers');
const { deleteAnswer } = require('../../src/controllers/answers');
const { getAnswersByPostId } = require('../../src/controllers/answers');
const { getAnswersByAnswerId } = require('../../src/controllers/answers');


const mongoose = require('mongoose');

jest.mock('../../src/models/Answer');
const Answer = require('../../src/models/answer');
const Post = require('../../src/models/post');

const UserFollower = require('../../src/models/userFollower');

const app = express();
app.use(express.json());

app.get('/api/answer/:id', getAnswerById);
app.post('/api/answers', createAnswer);
app.put('/api/answers/:answer_id', updateAnswer);
app.delete('/api/answers/:answer_id', deleteAnswer);
app.get('/api/answers/post/:post_id', getAnswersByPostId);
app.get('/api/answers/answer/:answer_id', getAnswersByAnswerId);

describe('GET /api/answer/:id', () => {
    it('debe retornar la respuesta con codigo 200', async () => {
        const fakeAnswer = {
            _id: '1234567890abcdef12345678',
            content: 'Esta es una respuesta de prueba',
            author: {
                _id: '1234567890abcdef12345678',
                name: 'Juan Perez',
            }
        };

        Answer.findById = jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(fakeAnswer),
        });
        const res = await request(app)
            .get(`/api/answer/${fakeAnswer._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(fakeAnswer);

    });

    it('debe retornar un error 404 si la respuesta no existe', async () => {

        Answer.findById = jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(null),
        });

        const res = await request(app)
            .get(`/api/answer/456d6e4f1c4b8a3f8c8b4567`);

        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({
            message: "Respuesta no encontrada"
        });
    });

    it('debe retornar un error 500 si ocurre un error en el servidor', async () => {
        Answer.findById = jest.fn().mockReturnValue({
            populate: jest.fn().mockRejectedValue(new Error('Error en el servidor'))
        });

        const res = await request(app)
            .get(`/api/answer/456d6e4f1c4b8a3f8c8b4567`);

        expect(res.statusCode).toBe(500);
    });
});


describe('POST /api/answers', () => {
    it('debe crear una nueva respuesta y retornar un código 201', async () => {
        const newAnswer = {
            content: 'Esta es una respuesta de prueba',
            author: {
                _id: '1234567890abcdef12345678',
                name: 'Juan Perez'
            },
            post: '1234567890abcdef12345678'
        };

        Answer.create = jest.fn().mockResolvedValue(newAnswer);
        Post.findByIdAndUpdate = jest.fn().mockResolvedValue({});

        const res = await request(app)
            .post('/api/answers')
            .send(newAnswer);

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual(newAnswer);
    });


    it('debe retornar un error 400 si falta el contenido', async () => {
        const newAnswer = {
            author: {
                _id: '1234567890abcdef12345678',
                name: 'Juan Perez',
            }
        };

        const res = await request(app)
            .post('/api/answers')
            .send(newAnswer);

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
            message: 'El contenido de la respuesta es obligatorio'
        });
    });

    it('debe retornar un error 400 si falta el autor', async () => {
        const newAnswer = {
            content: 'Esta es una respuesta de prueba',

        };

        const res = await request(app)
            .post('/api/answers')
            .send(newAnswer);

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
            message: 'El autor de la respuesta es obligatorio'
        });
    });

    it('debe retornar un error 500 si ocurre un error en el servidor', async () => {
        Answer.create = jest.fn().mockRejectedValue(new Error('Error en el servidor'));

        const newAnswer = {
            content: 'Esta es una respuesta de prueba',
            author: {
                _id: '1234567890abcdef12345678',
                name: 'Juan Perez',
            }
        };

        const res = await request(app)
            .post('/api/answers')
            .send(newAnswer);

        expect(res.statusCode).toBe(500);
    });
});


describe('PUT /api/answers/:answer_id', () => {
    it('debe actualizar una respuesta y retornar un codigo 200', async () => {
        const updatedAnswer = {
            _id: '1234567890abcdef12345678',
            content: 'Esta es una respuesta actualizada',
            author: {
                _id: '1234567890abcdef12345678',
                name: 'Juan Perez',
            }
        };

        Answer.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedAnswer);

        const res = await request(app)
            .put(`/api/answers/${updatedAnswer._id}`)
            .send(updatedAnswer);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(updatedAnswer);
    });

    it('debe intentar actualizar la respuesta y fallar al faltar el contenido con codigo 400', async () => {
        const updatedAnswer = {
            _id: '1234567890abcdef12345678',
            author: {
                _id: '1234567890abcdef12345678',
                name: 'Juan Perez',
            }
        };

        Answer.findByIdAndUpdate = jest.fn().mockReturnValue(null);

        const res = await request(app)
            .put(`/api/answers/${updatedAnswer._id}`)
            .send(updatedAnswer);

        expect(res.statusCode).toBe(400);
    });

    it('debe retornar un error 404 si la respuesta no existe', async () => {
        Answer.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

        const res = await request(app)
            .put('/api/answers/456d6e4f1c4b8a3f8c8b4567')
            .send({ content: 'Contenido actualizado' });

        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({
            message: 'Respuesta no encontrada'
        });
    });

    it('debe retornar un error 500 si ocurre un error en el servidor', async () => {
        Answer.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Error en el servidor'));

        const res = await request(app)
            .put('/api/answers/1234567890abcdef12345678')
            .send({ content: 'Contenido actualizado' });

        expect(res.statusCode).toBe(500);
    });
});


describe('DELETE /api/answers/:answer_id', () => {
    it('debe eliminar una respuesta y retornar un codigo 200', async () => {
        const deletedAnswer = {
            _id: '1234567890abcdef12345678',
            content: 'Esta es una respuesta eliminada',
            author: {
                _id: '1234567890abcdef12345678',
                name: 'Juan Perez',
            }
        };

        Answer.findByIdAndUpdate = jest.fn().mockResolvedValue(deletedAnswer);

        const res = await request(app)
            .delete(`/api/answers/${deletedAnswer._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            message: "Respuesta eliminada correctamente"
        });
    });

    it('debe retornar un error 404 si la respuesta no existe', async () => {
        Answer.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

        notValidId = "1234597890abcdef12345678";

        const res = await request(app)
            .delete(`/api/answers/${notValidId}`);

        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({
            message: "Respuesta no encontrada"
        });
    });

    it('debe retornar un error 500 si ocurre un error en el servidor', async () => {
        Answer.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Error en el servidor'));

        const res = await request(app)
            .delete('/api/answers/1234567890abcdef12345678');

        expect(res.statusCode).toBe(500);
    });
});



describe('GET /api/answers/post/:post_id', () => {
    it('debe retornar las respuestas de un post y un codigo 200', async () => {

        const fakeAnswers = [
            {
                _id: '1234567890abcdef12345678',
                content: 'Esta es una respuesta de prueba',
                status: 'Active',
                author: {
                    _id: 'author1',
                    name: 'Juan Pérez'
                },
                post: {
                    _id: 'post1'
                },
                toObject: function () {
                    return {
                        ...this,
                        author: {
                            ...this.author,
                            isFollowed: true // o false, se sobreescribe más adelante
                        }
                    };
                }
            }
        ];

        // Mock encadenado de Answer.find(...).skip().limit().sort().populate().populate()
        Answer.find = jest.fn(() => ({
            skip: jest.fn(() => ({
                limit: jest.fn(() => ({
                    sort: jest.fn(() => ({
                        populate: jest.fn(() => ({
                            populate: jest.fn().mockResolvedValue(fakeAnswers)
                        }))
                    }))
                }))
            }))
        }));

        // También necesitas mockear countDocuments
        Answer.countDocuments = jest.fn().mockResolvedValue(1);

        // Mock para UserFollower.find
        UserFollower.find = jest.fn().mockResolvedValue([
            {
                follower: 'user123',
                user: 'author1'
            }
        ]);

        const res = await request(app)
            .get('/api/answers/post/post1')
            .query({ page: 1, limit: 10, user: 'user123' });

        expect(res.status).toBe(200);
        expect(res.body.answers).toHaveLength(1);
        expect(res.body.answers[0].author.isFollowed).toBe(true);
    });

    it('debe retornar 200 y arreglo vacío cuando no hay respuestas', async () => {
        // Total de respuestas para el post (puedes poner > 0 o 0, da igual para este caso)
        Answer.countDocuments = jest.fn().mockResolvedValue(0);

        // Simula que no hay respuestas activas (arreglo vacío)
        Answer.find = jest.fn(() => ({
            skip: jest.fn(() => ({
                limit: jest.fn(() => ({
                    sort: jest.fn(() => ({
                        populate: jest.fn(() => ({
                            populate: jest.fn().mockResolvedValue([])  // <-- aquí está el arreglo vacío
                        }))
                    }))
                }))
            }))
        }));

        // UserFollower.find no importa en este caso, pero lo puedes mockear igual
        UserFollower.find = jest.fn().mockResolvedValue([]);

        const res = await request(app)
            .get('/api/answers/post/post1')
            .query({ page: 1, limit: 10, user: 'user123' });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            currentPage: 1,
            totalPages: 0,
            totalAnswers: 0,
            answers: []
        });
    });




    it('debe retornar un error 500 si ocurre un error en el servidor', async () => {
        Answer.find = jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
                populate: jest.fn().mockRejectedValue(new Error('Error en el servidor'))
            })
        });


        const res = await request(app)
            .get('/api/answers/post/1234567890abcdef12345678');

        expect(res.statusCode).toBe(500);
    });
});

describe('GET /api/answers/answer/:answer_id', () => {
    it('debe retornar una respuesta y un código 200', async () => {
        const fakeAnswers = [
            {
                _id: '1234567890abcdef12345678',
                content: 'Esta es una respuesta de prueba',
                parentAnswer: '1234567890abcdef12345678',
                author: {
                    _id: '1234567890abcdef12345678',
                    name: 'Juan Perez'
                }
            },
            {
                _id: '1234567890abcdef12345679',
                content: 'Esta es otra respuesta de prueba',
                parentAnswer: '1234567890abcdef12345678',
                author: {
                    _id: '1234567890abcdef12345678',
                    name: 'Juan Perez'
                }
            }
        ];

        // Mocks
        Answer.find = jest.fn(() => ({
            skip: jest.fn(() => ({
                limit: jest.fn(() => ({
                    sort: jest.fn(() => ({
                        populate: jest.fn().mockResolvedValue(fakeAnswers)
                    }))
                }))
            }))
        }));

        Answer.countDocuments = jest.fn().mockResolvedValue(fakeAnswers.length);

        const res = await request(app)
            .get('/api/answers/answer/1234567890abcdef12345678');

        expect(res.statusCode).toBe(200);
        expect(res.body.answers).toEqual(fakeAnswers);
        expect(res.body.totalAnswers).toBe(2);
    });




    it('debe retornar un error 500 si ocurre un error en el servidor', async () => {
        Answer.find = jest.fn().mockReturnValue({
            populate: jest.fn().mockRejectedValue(new Error('Error en el servidor'))
        });


        const res = await request(app)
            .get('/api/answers/answer/1234567890abcdef12345678');

        expect(res.statusCode).toBe(500);
    });
});
