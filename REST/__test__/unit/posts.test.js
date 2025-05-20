const request = require('supertest');
const express = require('express');
const { getPostById } = require('../../src/controllers/posts');
const { getPostsByUserId } = require('../../src/controllers/posts');
const { createPost } = require('../../src/controllers/posts');
const { updatePost } = require('../../src/controllers/posts');
const { deletePost } = require('../../src/controllers/posts');
const { getPosts } = require('../../src/controllers/posts');

const mongoose = require('mongoose');


jest.mock('../../src/models/Post');
const Post = require('../../src/models/post');

const app = express();
app.use(express.json());

app.get('/api/post/:id', getPostById);
app.get('/api/posts/user/:user_id', getPostsByUserId);
app.post('/api/posts', createPost);
app.put('/api/posts/:post_id', updatePost);
app.delete('/api/posts/:post_id', deletePost);
app.get('/api/posts', getPosts);

describe('GET /api/post/:id', () => {
  it('debe retornar el post con author poblado', async () => {
        const fakePost = {
          _id: '646464646464646464646464',
          title: 'Mi post de prueba',
          content: 'Contenido aquí',
          author: {
            _id: '123456789012345678901234',
            name: 'Autor de prueba'
          },
            categories: [
                { _id: '123456789012345678901234', name: 'Categoria 1' },
                { _id: '123456789012345678901235', name: 'Categoria 2' }
            ]
        };

        Post.findById = jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(fakePost)})
        });

        const res = await request(app).get(`/api/post/${fakePost._id}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(fakePost);
  });

    it('debe retornar 404 si el post no existe', async () => {

        Post.findById = jest.fn().mockReturnValue({
                  populate: jest.fn().mockReturnValue({
                  populate: jest.fn().mockResolvedValue(null)})
                });

        const res = await request(app).get(`/api/post/123`);

        expect(res.status).toBe(404);
    });

    it('debe retornar 500 si hay un error interno', async () => {

        Post.findById = jest.fn().mockReturnValue({
                  populate: jest.fn().mockReturnValue({
                  populate: jest.fn().mockRejectedValue(new Error('Error interno'))})
                });

        const res = await request(app).get(`/api/post/44`);

        expect(res.status).toBe(500);
    });
});

describe('GET /api/posts/user/:user_id', () => {
  it('debe retornar los posts de un autor específico', async () => {
    const authorId = '123456789012345678901234';
    const fakePosts = [
      {
        _id: 'aaa',
        title: 'Primer post',
        content: 'Contenido',
        author: { _id: authorId, name: 'Autor' }
      },
      {
        _id: 'bbb',
        title: 'Segundo post',
        content: 'Más contenido',
        author: { _id: authorId, name: 'Autor' }
      }
    ];

    Post.find = jest.fn().mockReturnValue({
                     populate: jest.fn().mockReturnValue({
                     populate: jest.fn().mockResolvedValue(fakePosts)})
                   });

    const res = await request(app).get(`/api/posts/user/${authorId}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakePosts);
  });



    it('debe retornar 500 al no suceder un error interno', async () => {
          const authorId = '123456789012345678901234';

           Post.find = jest.fn().mockReturnValue({
                            populate: jest.fn().mockReturnValue({
                            populate: jest.fn().mockRejectedValue(new Error('Error interno'))})
                          });

          const res = await request(app).get(`/api/posts/user/${authorId}`);

          expect(res.status).toBe(500);
    });
});

describe('POST /api/posts', () => {
    it('debe crear un nuevo post y retornar 201', async () => {
        const newPost = {
            title: 'Nuevo post',
            content: 'Contenido del nuevo post',
            author : '123456789012345678901234',
                        categories : ['123456789012345678901234']

        };
        Post.create = jest.fn().mockResolvedValue({
            _id: 'abc123',
            ...newPost
        });
        const res = await request(app)
          .post('/api/posts')
          .send(newPost);
        expect(res.status).toBe(201);
        expect(res.body).toEqual({_id: 'abc123',
          ...newPost
        });
    });

    it('debe retornar 400 y decir que se necesita un titulo', async () => {
        const newPost = {

            content: 'Contenido del nuevo post',
            author : '123456789012345678901234',
                        categories : ['123456789012345678901234']

        };
        Post.create = jest.fn().mockResolvedValue({
            _id: 'abc123',
            ...newPost
        });
        const res = await request(app)
          .post('/api/posts')
          .send(newPost);
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('El título de la publicación es obligatorio');
    });

    it('debe retornar 400 y decir que se necesita un contenido', async () => {
        const newPost = {
            title: 'Nuevo post',
            author : '123456789012345678901234',
                        categories : ['123456789012345678901234']

        };
        Post.create = jest.fn().mockResolvedValue({
            _id: 'abc123',
            ...newPost
        });
        const res = await request(app)
          .post('/api/posts')
          .send(newPost);
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('El contenido de la publicación es obligatorio');
    });

    it('debe retornar 400 y decir que se necesita un autor', async () => {
        const newPost = {
            title: 'Nuevo post',
            content : 'Contenido del nuevo post',
            categories : ['123456789012345678901234']
        };
        Post.create = jest.fn().mockResolvedValue({
            _id: 'abc123',
            ...newPost
        });
        const res = await request(app)
          .post('/api/posts')
          .send(newPost);
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('El autor de la publicación es obligatorio');
    });

     it('debe retornar 400 y decir que se necesitan categorias', async () => {
            const newPost = {
                title: 'Nuevo post',
                content : 'Contenido del nuevo post',
                author : '123456789012345678901234'
            };
            Post.create = jest.fn().mockResolvedValue({
                _id: 'abc123',
                ...newPost
            });
            const res = await request(app)
              .post('/api/posts')
              .send(newPost);
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Las categorías de la publicación son obligatorias');
        });

    it('debe retornar 500 y decir error interno', async () => {
        const newPost = {
            title: 'Nuevo post',
            author : '123456789012345678901234',
            content : 'Contenido del nuevo post',
                        categories : ['123456789012345678901234']

        };
        Post.create = jest.fn().mockRejectedValue(
            new Error('Error interno')
        );
        const res = await request(app)
          .post('/api/posts')
          .send(newPost);
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('Error al crear la publicación');
        expect(res.body.error).toBe('Error interno');
    });
 });

 describe('PUT /api/posts/:post_id', () => {
    it('debe actualizar un post y retornar 200', async () => {
        const postId = '646464646464646464646464';
        const updatedPost = {
            title: 'Post actualizado',
            content: 'Contenido actualizado'
        };

        Post.findByIdAndUpdate = jest.fn().mockResolvedValue({
            ...updatedPost,
            _id: postId
        });

        const res = await request(app)
          .put(`/api/posts/${postId}`)
          .send(updatedPost);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            ...updatedPost,
            _id: postId
        });
    });

    it('debe retornar 404 si el post no existe', async () => {
        const postId = '646464646464646464646464';
        const updatedPost = {
            title: 'Post actualizado',
            content: 'Contenido actualizado'
        };

        Post.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

        const res = await request(app)
          .put(`/api/posts/${postId}`)
          .send(updatedPost);

        expect(res.status).toBe(404);
    });

    it('debe retornar 400 si el post no tiene titulo', async () => {
        const postId = '646464646464646464646464';
        const updatedPost = {
            content: 'Contenido actualizado'
        };

        Post.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedPost);

        const res = await request(app)
          .put(`/api/posts/${postId}`)
          .send(updatedPost);

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('El título de la publicación es obligatorio');
    });

     it('debe retornar 400 si el post no tiene contenido', async () => {
            const postId = '646464646464646464646464';
            const updatedPost = {
                title: 'Post actualizado',
            };

            Post.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedPost);

            const res = await request(app)
              .put(`/api/posts/${postId}`)
              .send(updatedPost);

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('El contenido de la publicación es obligatorio');
        });

    it('debe retornar 500 si hay un error interno', async () => {
        const postId = '646464646464646464646464';
        const updatedPost = {
            title: 'Post actualizado',
            content: 'Contenido actualizado'
        };

        Post.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Error interno'));

        const res = await request(app)
          .put(`/api/posts/${postId}`)
          .send(updatedPost);

        expect(res.status).toBe(500);
    });
 });

 describe ('DELETE /api/posts/:post_id', () => {
    it('debe eliminar un post y retornar 200', async () => {
        const postId = '646464646464646464646464';

        Post.findByIdAndUpdate = jest.fn().mockResolvedValue({
            _id: postId,
            status: 'Inactive'
        });

        const res = await request(app)
          .delete(`/api/posts/${postId}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            message: "Publicacion eliminada correctamente"
        });
    });

    it('debe retornar 404 si el post no existe', async () => {
        const postId = '646464646464646464646464';

        Post.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

        const res = await request(app)
          .delete(`/api/posts/${postId}`);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Publicacion no encontrada');
    });

    it('debe retornar 500 si hay un error interno', async () => {
        const postId = '646464646464646464646464';

        Post.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Error interno'));

        const res = await request(app)
          .delete(`/api/posts/${postId}`);

        expect(res.status).toBe(500);
    });
 });

 describe('GET /api/posts', () => {
    it('debe retornar los posts paginados y codigo 200', async () => {
       const fakePosts = [
         { _id: '1', title: 'Post 1' },
         { _id: '2', title: 'Post 2' }
       ];

       const populateMock = jest.fn().mockResolvedValue(fakePosts);
       const sortMock = jest.fn().mockReturnValue({ populate: populateMock });
       const limitMock = jest.fn().mockReturnValue({ sort: sortMock });
       const skipMock = jest.fn().mockReturnValue({ limit: limitMock });

       Post.find = jest.fn().mockReturnValue({ skip: skipMock });
       Post.countDocuments = jest.fn().mockResolvedValue(20);


        const res = await request(app).get('/api/posts?page=1&limit=10');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            currentPage: 1,
            totalPosts: 20,
            totalPages:2,
            posts: fakePosts});
    });

    it('debe retornar 500 si hay un error interno', async () => {


           const populateMock = jest.fn().mockRejectedValue(new Error('Error interno'));
           const sortMock = jest.fn().mockReturnValue({ populate: populateMock });
           const limitMock = jest.fn().mockReturnValue({ sort: sortMock });
           const skipMock = jest.fn().mockReturnValue({ limit: limitMock });

           Post.find = jest.fn().mockReturnValue({ skip: skipMock });
           Post.countDocuments = jest.fn().mockResolvedValue(20);


            const res = await request(app).get('/api/posts?page=1&limit=10');

            expect(res.status).toBe(500);

    });
 });

