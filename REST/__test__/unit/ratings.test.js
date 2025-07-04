const request = require('supertest');
const express = require('express');

const { getRatingById } = require('../../src/controllers/ratings');
const { createRating } = require('../../src/controllers/ratings');
const { getRatingsByAnswerId } = require('../../src/controllers/ratings');
const { updateRating } = require('../../src/controllers/ratings');

const mongoose = require('mongoose');

jest.mock('../../src/models/Rating');
const Rating = require('../../src/models/rating');
const Answer = require('../../src/models/answer');

const app = express();
app.use(express.json());

app.get('/api/ratings/:id', getRatingById);
app.post('/api/ratings', createRating);
app.get('/api/ratings/answer/:id', getRatingsByAnswerId);
app.put('/api/ratings/:id', updateRating);

describe('GET /api/ratings/:id', () => {
    it('Debe retornar la calificación por ID', async () => {
        const fakeRating = {
            _id: '1234567890abcdef12345678',
            value: 5,
        };
        Rating.findById = jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(fakeRating)
        });
        const response = await request(app).get('/api/ratings/1234567890abcdef12345678');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(fakeRating);
    });

    it('Debe retornar un error 404 si la calificación no existe', async () => {
        const fakeRating = null;
        Rating.findById = jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(fakeRating)
        });
        const response = await request(app).get('/api/ratings/1234567890abcdef12345678');
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: "Calificación no encontrada" });
    });

    it('Debe retornar un error 500 si ocurre un error en el servidor', async () => {
        const errorMessage = 'Error al recuperar la calificación';
        Rating.findById = jest.fn().mockReturnValue({
            populate: jest.fn().mockRejectedValue(new Error(errorMessage))
        });
        const response = await request(app).get('/api/ratings/1234567890abcdef12345678');
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            message: 'Error al recuperar la calificación',
            error: errorMessage,
        });
    });
});

describe('POST /api/ratings', () => {
    it('debe crear o actualizar un rating, actualizar la respuesta y retornar 201', async () => {
        const newRating = {
            qualification: 5,
            author: '1234567890abcdef12345678',
            answer: '1234567890abcdef12345678'
        };

        const ratings = [
            { qualification: 5 },
            { qualification: 3 },
            { qualification: 4 }
        ];

        const updatedAnswer = {
            _id: '1234567890abcdef12345678',
            qualification: 4,
            totalRatings: 3
        };

        // Mocks necesarios
        Rating.findOneAndUpdate = jest.fn().mockResolvedValue(newRating); // simula la calificación creada/actualizada
        Rating.find = jest.fn().mockResolvedValue(ratings); // todas las calificaciones de esa respuesta
        Answer.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedAnswer); // resultado esperado

        // Llamada real
        const response = await request(app).post('/api/ratings').send(newRating);

        // Validaciones
        expect(Rating.findOneAndUpdate).toHaveBeenCalledWith(
            { author: newRating.author, answer: newRating.answer },
            { qualification: newRating.qualification },
            { upsert: true, new: true }
        );

        expect(Rating.find).toHaveBeenCalledWith({ answer: newRating.answer });

        expect(Answer.findByIdAndUpdate).toHaveBeenCalledWith(
            newRating.answer,
            {
                qualification: 4, // promedio de [5,3,4]
                totalRatings: 3
            }
        );

        expect(response.status).toBe(201);
        expect(response.body).toEqual(updatedAnswer);
    });


    it('Debe retornar un error 400 si falta el valor de la calificación', async () => {
        const newRating = {
            author: '1234567890abcdef12345678',
            answer: '1234567890abcdef12345678',
        };
        Rating.create = jest.fn().mockResolvedValue(newRating);
        const response = await request(app).post('/api/ratings').send(newRating);
        expect(response.status).toBe(400);
    });

    it('Debe retornar un error 400 si falta el valor de el autor', async () => {
        const newRating = {
            qualification: 5,
            answer: '1234567890abcdef12345678',
        };
        Rating.create = jest.fn().mockResolvedValue(newRating);
        const response = await request(app).post('/api/ratings').send(newRating);
        expect(response.status).toBe(400);
    });

    it('Debe retornar un error 400 si falta el valor de la respuesta', async () => {
        const newRating = {
            qualification: 5,
            author: '1234567890abcdef12345678',
        };
        Rating.create = jest.fn().mockResolvedValue(newRating);
        const response = await request(app).post('/api/ratings').send(newRating);
        expect(response.status).toBe(400);
    });

    it('Debe retornar un error 500 si sucede un error', async () => {
        const newRating = {
            qualification: 5,
            author: '1234567890abcdef12345678',
            answer: '1234567890abcdef12345678'
        };

        // Mockeamos el método correcto con error
        Rating.findOneAndUpdate = jest.fn().mockRejectedValue(new Error('Error al crear la calificación'));

        const response = await request(app)
            .post('/api/ratings')
            .send(newRating);

        expect(response.status).toBe(500);
        expect(response.body).toEqual(expect.objectContaining({
            message: 'Error al crear la calificación',
            error: 'Error al crear la calificación'
        }));
    });

});

describe('GET /api/ratings/answer/:id', () => {
    it('Debe retornar las calificaciones por ID de respuesta', async () => {
        const fakeRatings = [
            {
                _id: '1234567890abcdef12345678',
                qualification: 5,
                author: '1234567890abcdef12345678',
                answer: '1234567890abcdef12345678',
            },
            {
                _id: '1234567890abcdef12345679',
                qualification: 4,
                author: '1234567890abcdef12345678',
                answer: '1234567890abcdef12345678',
            }];
        Rating.find = jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(fakeRatings)
        });
        const response = await request(app).get('/api/ratings/answer/1234567890abcdef12345678');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(fakeRatings);
    });

    it('Debe retornar las 404 cuando no se encuentra el post', async () => {

        Rating.find = jest.fn().mockReturnValue({
            populate: jest.fn().mockRejectedValue(new Error('Error interno'))
        });
        const response = await request(app).get('/api/ratings/answer/1234567890abcdef12345678');
        expect(response.status).toBe(500);
    });
});


describe('PUT /api/ratings/:id', () => {
    it('Debe actualizar una calificación y retornar 200', async () => {
        const updatedRating = {
            qualification: 4,
            author: '1234567890abcdef12345678',
            answer: '1234567890abcdef12345678',
        };
        Rating.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedRating);
        const response = await request(app).put('/api/ratings/1234567890abcdef12345678').send(updatedRating);
        expect(response.status).toBe(200);
        expect(response.body).toEqual(updatedRating);
    });

    it('Debe retornar 400 al no tener nueva calificacion', async () => {
        const updatedRating = {
            author: '1234567890abcdef12345678',
            answer: '1234567890abcdef12345678',
        };
        Rating.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedRating);
        const response = await request(app).put('/api/ratings/1234567890abcdef12345678').send(updatedRating);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'El valor de la calificación es obligatorio' });
    });

    it('Debe retornar un error 404 si la calificación no existe', async () => {
        const updatedRating = {
            qualification: 4,
            author: '1234567890abcdef12345678',
            answer: '1234567890abcdef12345678',
        };
        Rating.findByIdAndUpdate = jest.fn().mockResolvedValue(null);
        const response = await request(app).put('/api/ratings/1234567890abcdef12345678').send(updatedRating);
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Calificación no encontrada' });
    });

});
