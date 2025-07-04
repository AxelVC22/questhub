const request = require('supertest');
const express = require('express');
const { getCategoryById } = require('../../src/controllers/categories');
const { getCategories } = require('../../src/controllers/categories');
const { createCategory } = require('../../src/controllers/categories');
const { updateCategory } = require('../../src/controllers/categories');
const { deleteCategory } = require('../../src/controllers/categories');

jest.mock('../../src/models/Category');
const Category = require('../../src/models/category');

const app = express();
app.use(express.json());

app.get('/api/category/:id', getCategoryById);
app.get('/api/categories', getCategories);
app.post('/api/categories', createCategory);
app.put('/api/categories/:category_id', updateCategory);
app.delete('/api/categories/:category_id/delete', deleteCategory);

describe('GET /api/categories', () => {
  it('debe retornar las categorías si existen', async () => {
    const fakeCategories = [
      { _id: '123', name: 'Tecnología' },
      { _id: '456', name: 'Salud' }
    ];
    Category.find.mockResolvedValue(fakeCategories);

    const response = await request(app).get('/api/categories');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(fakeCategories);
  });

  it('debe retornar las categorías si existen con base en un estado', async () => {
    const fakeCategories = [
      { _id: '123', name: 'Tecnología' },
      { _id: '456', name: 'Salud' }
    ];
    Category.find.mockResolvedValue(fakeCategories);

    const response = await request(app).get('/api/categories?status=Active');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(fakeCategories);
  });

  it('debe retornar un array vacío si no hay categorías', async () => {
    Category.find.mockResolvedValue([]);
    const response = await request(app).get('/api/categories');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('debe retornar 500 si hay error interno', async () => {
    Category.find.mockRejectedValue(new Error('Error en la base de datos'));
    const response = await request(app).get('/api/categories');
    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Error al recuperar las categorías');
    expect(response.body.error).toBe('Error en la base de datos');
  });

});

describe('GET /api/category/:id', () => {
  it('debe retornar la categoría si existe', async () => {
    const fakeCategory = { _id: '123', name: 'Tecnología' };
    Category.findById.mockResolvedValue(fakeCategory);
    const response = await request(app).get('/api/category/123');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(fakeCategory);
  });

  it('debe retornar 404 si no encuentra la categoría', async () => {
    Category.findById.mockResolvedValue(null);
    const response = await request(app).get('/api/category/999');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "Categoría no encontrada"
    });
  });

  it('debe retornar 500 si hay error interno', async () => {
    Category.findById.mockRejectedValue(new Error('Error en la base de datos'));

    const response = await request(app).get('/api/category/123');

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Error al recuperar la categoría');
    expect(response.body.error).toBe('Error en la base de datos');
  });
});




describe('POST /api/categories', () => {
  it('debe crear una categoría y retornar 201', async () => {
    const newCategory = {
      name: 'Deportes',
      description: 'Categoría de deportes',
      status: 'Active'
    };

    Category.create.mockResolvedValue({ _id: 'abc123', ...newCategory });

    const res = await request(app)
      .post('/api/categories')
      .send(newCategory);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.name).toBe('Deportes');
  });

  it('debe fallar al faltar un nombre y retornar 400', async () => {
    const newCategory = {
      description: 'Categoría de deportes',
      status: 'Active'
    };

    Category.create.mockResolvedValue({ _id: 'abc123', ...newCategory });

    const res = await request(app)
      .post('/api/categories')
      .send(newCategory);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('El nombre de la categoría es obligatorio');
  });

  it('debe fallar al faltar un nombre y retornar 400', async () => {
    const newCategory = {
      name: 'Juegos',
      status: 'Active'
    };

    Category.create.mockResolvedValue({ _id: 'abc123', ...newCategory });

    const res = await request(app)
      .post('/api/categories')
      .send(newCategory);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('La descripción de la categoría es obligatoria');
  });

  it('debe retornar 500 en caso de error interno', async () => {
    const newCategory = {
      name: 'Errores',
      description: 'Causa error',
      status: 'Active'
    };

    Category.create.mockRejectedValue(new Error('Error interno'));

    const res = await request(app)
      .post('/api/categories')
      .send(newCategory);

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Error al crear la categoría');
    expect(res.body.error).toBe('Error interno');
  });
});




describe('PUT /api/categories/:category_id', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe actualizar una categoría y retornar 200', async () => {
    const updates = { name: 'Tecnología actualizada' };
    const categoryId = 'abc123';

    Category.findByIdAndUpdate.mockResolvedValue({ _id: categoryId, ...updates });

    const res = await request(app)
      .put(`/api/categories/${categoryId}`)
      .send(updates);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Tecnología actualizada');
  });

  it('debe retornar 400 si ya existe otra categoría con ese nombre', async () => {
    const categoryId = 'abc123';
    const updates = { name: 'Tecnología' };

    Category.findOne.mockResolvedValue({ _id: 'otroId', name: 'Tecnología' });
    Category.findByIdAndUpdate.mockResolvedValue(null);

    const res = await request(app)
      .put(`/api/categories/${categoryId}`)
      .send(updates);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Ya existe una categoría con ese nombre' });

    expect(Category.findByIdAndUpdate).not.toHaveBeenCalled();
  });



  it('debe retornar 404 si no existe categoría para actualizar', async () => {
    Category.findOne = jest.fn().mockResolvedValue(null);
    Category.findByIdAndUpdate = jest.fn().mockResolvedValue(null); // no se encuentra la categoría

    const res = await request(app)
      .put('/api/categories/abc123')
      .send({ name: 'Nuevo nombre' });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Categoría no encontrada');
  });


  it('debe retornar 500 en caso de error interno', async () => {
    Category.findOne = jest.fn().mockResolvedValue(null); 
    Category.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Error DB'));

    const res = await request(app)
      .put('/api/categories/abc123')
      .send({ name: 'Nuevo nombre' });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Error al actualizar la categoría');
    expect(res.body.error).toBe('Error DB');
  });

});

describe('DELETE /api/categories/:category_id/delete', () => {
  it('debe cambiar el status (eliminar) y retornar 200', async () => {
    const categoryId = 'abc123';

    Category.findByIdAndUpdate.mockResolvedValue({ _id: categoryId, status: false });

    const res = await request(app)
      .delete(`/api/categories/${categoryId}/delete`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(false);
  });

  it('debe retornar 404 si no encuentra la categoría para eliminar', async () => {
    Category.findByIdAndUpdate.mockResolvedValue(null);

    const res = await request(app)
      .delete(`/api/categories/abc123/delete`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Categoría no encontrada');
  });

  it('debe retornar 500 en caso de error', async () => {
    Category.findByIdAndUpdate.mockRejectedValue(new Error('Error DB'));

    const res = await request(app)
      .delete(`/api/categories/abc123/delete`);

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Error al eliminar la categoría');
    expect(res.body.error).toBe('Error DB');
  });
});