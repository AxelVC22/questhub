const request = require('supertest');
const express = require('express');

jest.mock('../../src/models/User');
jest.mock('../../src/models/Answer');
jest.mock('../../src/models/Rating');
jest.mock('../../src/models/Post');


const { getUserById } = require('../../src/controllers/users');
const { updateUser } = require('../../src/controllers/users');
const { disableUser } = require('../../src/controllers/users');
const { followUser } = require('../../src/controllers/users');
const { unfollowUser } = require('../../src/controllers/users');
const { register } = require('../../src/controllers/users');

const { getUsers } = require('../../src/controllers/users');
const { updateUserProfilePicture } = require('../../src/controllers/users');
const { updateUserPassword } = require('../../src/controllers/users');
const { getFollowersByUserId } = require('../../src/controllers/users');
const { getUserStatistics } = require('../../src/controllers/users');


const mongoose = require('mongoose');


const User = require('../../src/models/user');
const UserFollower = require('../../src/models/userFollower');
const Post = require('../../src/models/post');
const Answer = require('../../src/models/answer');
const Rating = require('../../src/models/rating');

const app = express();
app.use(express.json());
app.get('/api/users', getUsers);
app.get('/api/user/:_id', getUserById);
app.put('/api/users/:_id', updateUser);
app.put('/api/users/:_id/delete', disableUser);
app.put('/api/users/:_id/follow', followUser);
app.put('/api/users/:_id/unfollow', unfollowUser);
app.put('/api/users/:_id/profile-picture', updateUserProfilePicture);
app.put('/api/users/:_id/password', updateUserPassword);
app.get('/api/users/:_id/followers', getFollowersByUserId);
app.post('/api/users', register);
app.get('/api/users/statistics/:_id', getUserStatistics);


describe('GET /api/users', () => {
  it('debe retornar 200 y la lista de usuarios', async () => {
    const fakeUsers = [
      { _id: '1', name: 'Juan', email: 'juan@example.com' },
      { _id: '2', name: 'Ana', email: 'ana@example.com' }
    ];

    User.find = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue(fakeUsers)
    });

    const res = await request(app).get('/api/users');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeUsers);
  });

  it('debe retornar 500 si ocurre un error al recuperar usuarios', async () => {
    User.find = jest.fn().mockReturnValue({
      select: jest.fn().mockRejectedValue(new Error('DB error'))
    });

    const res = await request(app).get('/api/users');

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Error al recuperar los usuarios');
    expect(res.body.error).toBeDefined();
  });


});

describe('GET /api/user/:_id', () => {
  it('debe retornar el usuario y codigo 200', async () => {
    const mockUserId = '1234567890abcdef12345678';
    const mockUser = {
      _id: mockUserId,
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

  it('debe retornar 404 si no encuentra el usuario', async () => {
    const mockUserId = '1234567890abcdef12345678';

    User.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue(null)
    });

    const response = await request(app).get(`/api/user/${mockUserId}`);
    expect(response.status).toBe(404);
  });

  it('debe retornar 500 si sucede un error interno', async () => {
    const mockUserId = '1234567890abcdef12345678';

    User.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockRejectedValue(new Error('Error interno'))
    });

    const response = await request(app).get(`/api/user/${mockUserId}`);
    expect(response.status).toBe(500);
  });
});

describe('PUT /api/users/:_id', () => {
  it('debe actualizar el usuario y retornar 200', async () => {
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

  it('debe retornar 404 si no lo encuentra', async () => {
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

  it('debe retornar 404 si no lo encuentra', async () => {
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

  it('debe retornar 400 si el correo ya está registrado por otro usuario', async () => {
    const userId = '1234567890abcdef12345678';
    const updateData = {
      name: 'Nuevo Nombre',
      email: 'duplicado@example.com'
    };

    User.findOne = jest.fn().mockResolvedValue({
      _id: 'otroId',
      email: 'duplicado@example.com'
    });

    User.findByIdAndUpdate = jest.fn();

    const res = await request(app)
      .put(`/api/users/${userId}`)
      .send(updateData);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('El correo electrónico ya está registrado, intente con otro');
    expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
  });

});

describe('PUT /api/users/:_id', () => {
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

    User.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Error interno'));

    const response = await request(app)
      .put(`/api/users/${userId}/delete`)
      .send({ banEndDate: updatedUser.banEndDate });

    expect(response.status).toBe(500);
  });



  describe('PUT /api/users/:_id/password', () => {
    it('debe actualizar la contraseña y retornar 200', async () => {
      const userId = '1234567890abcdef12345678';
      const newPassword = 'nuevaContraseña';

      const user = {
        _id: userId,
        name: 'Juan Pérez',
        email: 'juan@example.com',
        role: 'user',
        profilePicture: 'https://example.com/profile.jpg',
        password: 'hashed_old_password',
        save: jest.fn().mockResolvedValue(true)
      };

      User.findById.mockResolvedValue(user);

      const response = await request(app)
        .put(`/api/users/${userId}/password`)
        .send({ password: newPassword });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Contraseña actualizada');
      expect(response.body.user).toEqual({
        _id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture
      });
      expect(user.save).toHaveBeenCalled();
    });

    it('debe retornar 400 si el usuario no existe', async () => {
      User.findById.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/users/123/password')
        .send({ password: 'cualquiera' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Usuario no encontrado');
    });

    it('debe retornar 500 si ocurre un error en el proceso', async () => {
      User.findById.mockRejectedValue(new Error('Error DB'));

      const response = await request(app)
        .put('/api/users/123/password')
        .send({ password: 'cualquiera' });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error al actualizar la contraseña');
      expect(response.body.error).toBeDefined();
    });

    it('debe permitir que la contraseña esté vacía y no hacer cambios', async () => {
      const user = {
        _id: '123',
        name: 'Test',
        email: 'test@example.com',
        role: 'user',
        profilePicture: '',
        password: 'oldhash',
        save: jest.fn().mockResolvedValue(true)
      };

      User.findById.mockResolvedValue(user);

      const response = await request(app)
        .put('/api/users/123/password')
        .send({});

      expect(response.status).toBe(200);
      expect(user.password).toBe('oldhash'); 
      expect(user.save).toHaveBeenCalled();
      expect(response.body.message).toBe('Contraseña actualizada');
    });
  });

  describe('PUT /api/users/:_id/follow', () => {
    const followedId = '1234567890abcdef12345678';
    const followerId = 'abcdef123456789012345678';

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('debe retornar 400 si el usuario intenta seguirse a sí mismo', async () => {
      const response = await request(app)
        .put(`/api/users/${followedId}/follow`)
        .send({ userId: followedId });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('No puedes seguirte a ti mismo');
    });

    it('debe retornar 404 si algún usuario no se encuentra', async () => {
      User.findById = jest.fn()
        .mockResolvedValueOnce(null); 

      const response = await request(app)
        .put(`/api/users/${followedId}/follow`)
        .send({ userId: followerId });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Usuario(s) no encontrado(s)');
    });

    it('debe retornar 400 si ya sigue al usuario', async () => {
      User.findById = jest.fn()
        .mockResolvedValueOnce({ _id: followedId })  // usuario a seguir
        .mockResolvedValueOnce({ _id: followerId }); // seguidor

      UserFollower.findOne = jest.fn().mockResolvedValue({ _id: 'followId' });

      const response = await request(app)
        .put(`/api/users/${followedId}/follow`)
        .send({ userId: followerId });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Ya sigues a este usuario');
    });

    it('debe seguir al usuario correctamente y retornar 200', async () => {
      User.findById = jest.fn()
        .mockResolvedValueOnce({ _id: followedId })  
        .mockResolvedValueOnce({ _id: followerId }); 

      UserFollower.findOne = jest.fn().mockResolvedValue(null);
      UserFollower.prototype.save = jest.fn().mockResolvedValue(true);
      User.updateOne = jest.fn().mockResolvedValue({});

      const response = await request(app)
        .put(`/api/users/${followedId}/follow`)
        .send({ userId: followerId });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Usuario seguido correctamente');
    });

    it('debe retornar 500 si ocurre un error inesperado', async () => {
      User.findById = jest.fn().mockRejectedValue(new Error('Error DB'));

      const response = await request(app)
        .put(`/api/users/${followedId}/follow`)
        .send({ userId: followerId });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error interno al seguir al usuario');
    });
  });


  describe('PUT /api/users/:_id/unfollow', () => {
    const followedId = '1234567890abcdef12345678';
    const followerId = 'abcdef123456789012345678';

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('debe retornar 400 si el usuario intenta dejar de seguirse a sí mismo', async () => {
      const response = await request(app)
        .put(`/api/users/${followedId}/unfollow`)
        .send({ userId: followedId });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('No puedes dejar de seguirte a ti mismo');
    });

    it('debe retornar 404 si algún usuario no se encuentra', async () => {
      User.findById = jest.fn().mockResolvedValueOnce(null);

      const response = await request(app)
        .put(`/api/users/${followedId}/unfollow`)
        .send({ userId: followerId });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Usuario(s) no encontrado(s)');
    });

    it('debe retornar 400 si no estaba siguiendo al usuario', async () => {
      User.findById = jest.fn()
        .mockResolvedValueOnce({ _id: followedId })
        .mockResolvedValueOnce({ _id: followerId });

      UserFollower.findOne = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .put(`/api/users/${followedId}/unfollow`)
        .send({ userId: followerId });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('No sigues a este usuario');
    });

    it('debe dejar de seguir correctamente y retornar 200', async () => {
      User.findById = jest.fn()
        .mockResolvedValueOnce({ _id: followedId })
        .mockResolvedValueOnce({ _id: followerId });

      UserFollower.findOne = jest.fn().mockResolvedValue({ _id: 'existingFollow' });
      UserFollower.findOneAndDelete = jest.fn().mockResolvedValue({});
      User.updateOne = jest.fn().mockResolvedValue({});

      const response = await request(app)
        .put(`/api/users/${followedId}/unfollow`)
        .send({ userId: followerId });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Usuario dejado de seguir correctamente');
    });

    it('debe retornar 500 si ocurre un error interno', async () => {
      User.findById = jest.fn().mockRejectedValue(new Error('Error DB'));

      const response = await request(app)
        .put(`/api/users/${followedId}/unfollow`)
        .send({ userId: followerId });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error interno al seguir al usuario');
    });
  });

  describe('GET /api/users/:_id/followers', () => {
    const userId = '1234567890abcdef12345678';

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('debe retornar la lista de seguidores con status 200', async () => {
      const fakeFollowers = [
        { follower: { _id: 'follower1', name: 'Juan' } },
        { follower: { _id: 'follower2', name: 'Ana' } },
      ];

      UserFollower.find = jest.fn(() => ({
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(fakeFollowers)
      }));

      const res = await request(app).get(`/api/users/${userId}/followers`);

      expect(res.status).toBe(200);
      console.log(res.message);
      expect(res.body.followers).toEqual(fakeFollowers);
    });

    it('debe retornar status 500 y mensaje de error en caso de excepción', async () => {
      UserFollower.find = jest.fn(() => ({
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockRejectedValue(new Error('Error DB'))
      }));

      const res = await request(app).get(`/api/users/${userId}/followers`);

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Error al obtener seguidores');
      expect(res.body.error).toBe('Error DB');
    });
  });


  describe('POST /api/users', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('debe retornar 400 si el correo ya está registrado', async () => {
      User.findOne = jest.fn().mockResolvedValue({ _id: 'existId', email: 'test@example.com' });

      const res = await request(app)
        .post('/api/users')
        .send({ name: 'Test', email: 'test@example.com', password: '123456', role: 'user' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('El correo ya está registrado');
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    });

    it('debe crear un usuario y retornar mensaje y datos', async () => {
      User.findOne = jest.fn().mockResolvedValue(null);

      const saveMock = jest.fn().mockResolvedValue(true);
      User.mockImplementation(function (data) {
        this._id = 'newUserId';
        this.name = data.name;
        this.email = data.email;
        this.role = data.role;
        this.status = 'Active'; 
        this.save = saveMock;
      });

      const res = await request(app)
        .post('/api/users')
        .send({ name: 'Nuevo Usuario', email: 'nuevo@example.com', password: '123456', role: 'user' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Usuario creado correctamente');
      expect(res.body.user).toMatchObject({
        id: 'newUserId',
        name: 'Nuevo Usuario',
        email: 'nuevo@example.com',
        role: 'user',
      });
      expect(saveMock).toHaveBeenCalled();
    });

    it('debe retornar 500 si hay un error interno', async () => {
      User.findOne = jest.fn().mockRejectedValue(new Error('Error DB'));

      const res = await request(app)
        .post('/api/users')
        .send({ name: 'Fail User', email: 'fail@example.com', password: '123456', role: 'user' });

      expect(res.status).toBe(500);

    });
  });

  describe('GET /api/users/:_id/statistics', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

   

    it('debe retornar 500 en caso de error interno', async () => {
      const userId = '685b6374dd6814a61e4eb4fc';

      Post.countDocuments = jest.fn().mockRejectedValue(new Error('DB error'));

      const res = await request(app).get(`/api/users/statistics/${userId}`);

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        message: 'Error al obtener estadísticas',
        error: 'DB error'
      });
    });
  });


});





