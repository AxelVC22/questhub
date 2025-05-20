const request = require('supertest');
const express = require('express');

const { getUserById } = require('../../src/controllers/users');
const { updateUser } = require('../../src/controllers/users');
const { disableUser } = require('../../src/controllers/users');
const { followUser } = require('../../src/controllers/users');

const mongoose = require('mongoose');

jest.mock('../../src/models/User');

const User = require('../../src/models/user');
const UserFollower = require('../../src/models/userFollower');

const app = express();
app.use(express.json());

app.get('/api/user/:_id', getUserById);
app.put('/api/users/:_id', updateUser);
app.put('/api/users/:_id/delete', disableUser);
app.put('/api/users/:_id/follow', followUser);

describe('GET /api/user/:_id', () => {
    it ('debe retornar el usuario y codigo 200', async () => {
        const mockUserId = '1234567890abcdef12345678';
            const mockUser = {
                _id : mockUserId,
                name: 'John Doe',
                email: 'example@gmail.com',
                profilePicture: 'https://example.com/profile.jpg',
                role: 'user',
                status: 'Active',
                followers: 0
            };
            User.findById = jest.fn().mockReturnValue({
              select: jest.fn().mockResolvedValue(mockUser)
            });

            const response = await request(app).get(`/api/user/${mockUserId}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockUser);
    });

     it ('debe retornar 404 si no encuentra el usuario', async () => {
        const mockUserId = '1234567890abcdef12345678';

            User.findById = jest.fn().mockReturnValue({
              select: jest.fn().mockResolvedValue(null)
            });

            const response = await request(app).get(`/api/user/${mockUserId}`);
            expect(response.status).toBe(404);
     });

    it ('debe retornar 500 si sucede un error interno', async () => {
        const mockUserId = '1234567890abcdef12345678';

            User.findById = jest.fn().mockReturnValue({
              select: jest.fn().mockRejectedValue(new Error('Error interno'))
            });

            const response = await request(app).get(`/api/user/${mockUserId}`);
            expect(response.status).toBe(500);
     });
});

describe('PUT /api/users/:_id', () => {
    it ('debe actualizar el usuario y retornar 200', async () => {
        const userId = '1234567890abcdef12345678';
        const updatedUser = {
            _id: '1234567890abcdef12345678',
            name: 'John Doe',
            email: 'example@gmail.com',
            profilePicture: 'https://example.com/profile.jpg',
        };

        User.findByIdAndUpdate = jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(updatedUser)
        });

        const response = await request(app)
            .put(`/api/users/${userId}`)
            .send(updatedUser);
        expect(response.status).toBe(200);
    });

     it ('debe retornar 404 si no lo encuentra', async () => {
            const userId = '1234567890abcdef12345678';
            const updatedUser = {
                _id: '1234567890abcdef12345678',
                name: 'John Doe',
                email: 'example@gmail.com',
                profilePicture: 'https://example.com/profile.jpg',
            };

            User.findByIdAndUpdate = jest.fn().mockReturnValue({
              select: jest.fn().mockResolvedValue(null)
            });

            const response = await request(app)
                .put(`/api/users/${userId}`)
                .send(updatedUser);
            expect(response.status).toBe(404);
     });

      it ('debe retornar 404 si no lo encuentra', async () => {
             const userId = '1234567890abcdef12345678';
             const updatedUser = {
                 _id: '1234567890abcdef12345678',
                 name: 'John Doe',
                 email: 'example@gmail.com',
                 profilePicture: 'https://example.com/profile.jpg',
             };

             User.findByIdAndUpdate = jest.fn().mockReturnValue({
               select: jest.fn().mockRejectedValue(new Error('Error interno'))
             });

             const response = await request(app)
                 .put(`/api/users/${userId}`)
                 .send(updatedUser);
             expect(response.status).toBe(500);
      });
});

describe ('PUT /api/users/:_id/delete', () => {
   it('debe eliminar (deshabilitar) el usuario y retornar 200', async () => {
       const userId = '1234567890abcdef12345678';

       const updatedUser = {
         _id: userId,
         name: 'John Doe',
         email: 'example@gmail.com',
         profilePicture: 'https://example.com/profile.jpg',
         status: 'Inactive',
         banEndDate: '2025-12-31T23:59:59.000Z'
       };

       // Solo simulas findByIdAndUpdate
       User.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedUser);

       const response = await request(app)
         .put(`/api/users/${userId}/delete`)
         .send({ banEndDate: updatedUser.banEndDate });

       expect(response.status).toBe(200);
       expect(response.body.status).toBe('Inactive');
       expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
         userId,
         { status: 'Inactive', banEndDate: updatedUser.banEndDate },
         { new: true }
       );
   });

   it('debe eliminar 404 y decir que no se encontro el usuario', async () => {
          const userId = '1234567890abcdef12345678';

          const updatedUser = {
            _id: userId,
            name: 'John Doe',
            email: 'example@gmail.com',
            profilePicture: 'https://example.com/profile.jpg',
            status: 'Inactive',
            banEndDate: '2025-12-31T23:59:59.000Z'
          };

          // Solo simulas findByIdAndUpdate
          User.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

          const response = await request(app)
            .put(`/api/users/${userId}/delete`)
            .send({ banEndDate: updatedUser.banEndDate });

          expect(response.status).toBe(404);

   });

   it('debe eliminar 404 y decir que no se encontro el usuario', async () => {
         const userId = '1234567890abcdef12345678';

         const updatedUser = {
           _id: userId,
           name: 'John Doe',
           email: 'example@gmail.com',
           profilePicture: 'https://example.com/profile.jpg',
           status: 'Inactive',
           banEndDate: '2025-12-31T23:59:59.000Z'
         };

         // Solo simulas findByIdAndUpdate
         User.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Error interno'));

         const response = await request(app)
           .put(`/api/users/${userId}/delete`)
           .send({ banEndDate: updatedUser.banEndDate });

         expect(response.status).toBe(500);
   });
});

