const {request, response} = require('express');
const Post = require('../models/post');

const getPostById = async (req = request, res = response) => {
    try {
        const { post_id } = req.params;
        console.log('ID recibido:', post_id);
        const aux_post = await Post.findById(post_id).populate('author', 'name').populate('categories', 'name');

        if (!aux_post) {
            return res.status(404).json({
                message: "Publicacion no encontrada"
            });
        }

        return res.status(200).json(aux_post);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: 'Error al recuperar la publicacion',
            error : error.message
        });
    }
}

const createPost = async (req = request, res = response) => {
    try {
        const { title, content, author, categories } = req.body;
        if (!title) {
            return res.status(400).json({ message: 'El título de la publicación es obligatorio' });
        }

        if (!content) {
            return res.status(400).json({ message: 'El contenido de la publicación es obligatorio' });
        }

        if (!author) {
            return res.status(400).json({ message: 'El autor de la publicación es obligatorio' });
        }

        if (!categories || categories.length === 0) {
            return res.status(400).json({ message: 'Las categorías de la publicación son obligatorias' });
        }

        const newPost = await Post.create({ title, content, author, categories });

        return res.status(201).json(newPost);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            message: 'Error al crear la publicación',
            error: error.message,
        });
    }
};

const getPostsByUserId = async (req = request, res = response) => {
    try {
        const { user_id } = req.params;
        const posts = await Post.find({ author: user_id }).populate('author', 'name').populate('categories', 'name');

        return res.status(200).json(posts);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'Error al recuperar las publicaciones',
            error : error.message
        });
    }
}

const updatePost = async (req = request, res = response) => {
    try {
        const { post_id } = req.params;
        const { title, content, categories, multimedia } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'El título de la publicación es obligatorio' });
        }

        if (!content) {
            return res.status(400).json({ message: 'El contenido de la publicación es obligatorio' });
        }

        const updatedPost = await Post.findByIdAndUpdate(post_id, { title, content, multimedia }, { new: true });

        if (!updatedPost) {
            return res.status(404).json({
                message: "Publicacion no encontrada"
            });
        }

        return res.status(200).json(updatedPost);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'Error al actualizar la publicacion',
            error : error.message
        });
    }
}

const deletePost = async (req = request, res = response) => {
    try {
        const { post_id } = req.params;

        const deletedPost = await Post.findByIdAndUpdate(post_id, { status: 'Inactive' }, { new: true });

        if (!deletedPost) {
            return res.status(404).json({
                message: "Publicacion no encontrada"
            });
        }

        return res.status(200).json({
            message: "Publicacion eliminada correctamente"
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'Error al eliminar la publicacion',
            error : error.message
        });
    }
}

const getPosts = async (req = request, res = response) => {
  try {
    let { page = 1, limit = 10 } = req.query;

    page = Math.max(Number(page), 1);
    limit = Math.max(Number(limit), 1);

    const totalPosts = await Post.countDocuments();
    const totalPages = Math.ceil(totalPosts / limit);

    const posts = await Post.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('author', 'name').populate('categories', 'name');

    res.status(200).json({
      currentPage: page,
      totalPages,
      totalPosts,
      posts
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: 'Error al recuperar las publicaciones',
      error: error.message
    });
  }
};


module.exports = {
    getPostById,
    getPostsByUserId,
    createPost,
    updatePost,
    deletePost,
    getPosts
}