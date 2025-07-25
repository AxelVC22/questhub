const { request, response } = require('express');
const Post = require('../models/post');
const UserFollower = require('../models/userFollower');

const getPostById = async (req = request, res = response) => {
    try {
        const { post_id } = req.params;
        console.log('ID recibido:', post_id);
        const aux_post = await Post.findById(post_id).populate('author', 'name').populate('category', 'name');

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
            error: error.message
        });
    }
}

const createPost = async (req = request, res = response) => {
    try {
        const { title, content, author, category } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'El título de la publicación es obligatorio' });
        }

        if (!content) {
            return res.status(400).json({ message: 'El contenido de la publicación es obligatorio' });
        }

        if (!author) {
            return res.status(400).json({ message: 'El autor de la publicación es obligatorio' });
        }

        if (!category) {
            return res.status(400).json({ message: 'La categoría de la publicación es obligatoria' });
        }

        const newPost = await Post.create({ title, content, author, category });

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
        const posts = await Post.find({ author: user_id }).populate('author', 'name').populate('category', 'name');

        return res.status(200).json(posts);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'Error al recuperar las publicaciones',
            error: error.message
        });
    }
}

const updatePost = async (req = request, res = response) => {
    try {
        const { post_id } = req.params;
        const { title, content, category } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'El título de la publicación es obligatorio' });
        }

        if (!content) {
            return res.status(400).json({ message: 'El contenido de la publicación es obligatorio' });
        }

        const updatedPost = await Post.findByIdAndUpdate(post_id, { title, content, category }, { new: true });

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
            error: error.message
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
            error: error.message
        });
    }
}

const getPosts = async (req = request, res = response) => {
    try {
        let { page = 1, limit = 10, user, category, following, content } = req.query;

        page = Math.max(Number(page), 1);
        limit = Math.max(Number(limit), 1);

        // Filtro base
        const query = { status: 'Active' };

        // Filtro por texto en título o contenid
        if (content) {
            const regex = new RegExp(content, 'i'); // 'i' para case-insensitive
            query.$or = [
                { title: { $regex: regex } },
                { content: { $regex: regex } }
            ];
        }

        // Filtro por categoría
        if (category) {
            query.category = category;
        }

        // Si se solicita filtrar por los usuarios que sigue
        let followedIds = new Set();

        if (user && following === 'true') {
            const follows = await UserFollower.find({ follower: user }).select('user');
            followedIds = new Set(follows.map(f => f.user.toString()));

            if (followedIds.size === 0) {
                return res.status(200).json({
                    currentPage: page,
                    totalPages: 0,
                    totalPosts: 0,
                    posts: []
                });
            }

            query.author = { $in: Array.from(followedIds) };
        }

        const totalPosts = await Post.countDocuments(query);
        const totalPages = Math.ceil(totalPosts / limit);

        const posts = await Post.find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 })
            .populate('author', 'name')
            .populate('category', 'name');

        if (!posts.length) {
            return res.status(200).json({
                currentPage: page,
                totalPages,
                totalPosts,
                posts: []
            });
        }

        // Si no se solicitó filtro `following`, igual marcamos cuáles sí sigue
        if (user && following !== 'true') {
            const authorIds = posts
                .filter(post => post.author)
                .map(post => post.author._id.toString());

            const uniqueAuthorIds = [...new Set(authorIds)];

            const follows = await UserFollower.find({
                follower: user,
                user: { $in: uniqueAuthorIds }
            });

            followedIds = new Set(follows.map(f => f.user.toString()));
        }

        const postsWithFollowInfo = posts.map(post => {
            const p = post.toObject();
            if (p.author) {
                p.author.isFollowed = user
                    ? followedIds.has(post.author._id.toString())
                    : false;
            }
            return p;
        });

        res.status(200).json({
            currentPage: page,
            totalPages,
            totalPosts,
            posts: postsWithFollowInfo
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