const {request, response} = require('express');
const Category = require('../models/category');

const getCategoryById = async (req = request, res = response) => {
    try {
        const { category_id } = req.params;
        const aux_category = await Category.findById(category_id);

        if (!aux_category) {
            return res.status(404).json({
                message: "Categoría no encontrada"
            });
        }

        return res.status(200).json(aux_category);
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            message: 'Error al recuperar la categoría',
            error: error.message
        });
    }
};

const getCategories = async (req = request, res = response) => {
    try {
        const categories = await Category.find();
        return res.status(200).json(categories);
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            message: 'Error al recuperar las categorías',
            error: error.message
        });
    }
};

const createCategory = async (req = request, res = response) => {
    try {
     const { name, description, status } = req.body;
        if (!name) {
          return res.status(400).json({ message: 'El nombre de la categoría es obligatorio' });
        }

         if (!description) {
              return res.status(400).json({ message: 'La descripción de la categoría es obligatoria' });
         }
        const newCategory = await Category.create({ name, description, status });

        return res.status(201).json(newCategory);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
          message: 'Error al crear la categoría',
          error: error.message,
        });
    }
};

const updateCategory = async (req = request, res = response) => {
  try {
    const { category_id } = req.params;
    const updates = req.body;
    if (updates.name) {
          const existing = await Category.findOne({ name: updates.name, _id: { $ne: category_id } });
          if (existing) {
            return res.status(400).json({ message: 'Ya existe una categoría con ese nombre' });
          }
        }

        const updatedCategory = await Category.findByIdAndUpdate(category_id, updates, { new: true });


    if (!updatedCategory) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    return res.status(200).json(updatedCategory);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: 'Error al actualizar la categoría',
      error: error.message,
    });
  }
};

const deleteCategory = async (req = request, res = response) => {
  const { category_id } = req.params;

  try {
    const deletedCategory = await Category.findByIdAndUpdate(
      category_id,
      { status: 'Inactive' },
      { new: true }
    );

    if (!deletedCategory) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    return res.status(200).json(deletedCategory);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: 'Error al eliminar la categoría',
      error: error.message,
    });
  }
};

module.exports = { getCategoryById, getCategories, createCategory, updateCategory, deleteCategory };