const { request, response } = require('express');
const mongoose = require('mongoose');
const User = require('../models/user');
const bcrypt = require("bcryptjs");
const UserFollower = require('../models/userFollower');
const path = require('path');
const fs = require('fs');

const getUserById = async (req = request, res = response) => {
    const { _id } = req.params;
    try {
        const user = await User.findById(_id).select('-password -__v');
        if (!user) {
            return res.status(404).json({
                message: "Usuario no encontrado"
            });
        }
        return res.status(200).json(user);
    } catch (error) {
        console.error(error.message, error);
        res.status(500).json({
            message: 'Error al recuperar al usuario',
            error
        });
    }

}

const getUsers = async (req = request, res = response) => {
    try {
        const users = await User.find().select('-password -__v');
        res.json(users);
    } catch (error) {
        res.status(500).json({
            message: 'Error al recuperar los usuarios',
            error
        });
    }
}

const updateUser = async (req = request, res = response) => {
    try {
        const { _id } = req.params;
        const { name, email, role } = req.body;
        if (email) {
            const existingUser = await User.findOne({ email, _id: { $ne: _id } });
            if (existingUser) {
                return res.status(400).json({
                    message: 'El correo electrónico ya está registrado, intente con otro',
                });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            _id,
            { name, email, role },
            { new: true }
        ).select('-password -__v');

        if (!updatedUser) {
            return res.status(404).json({
                message: 'Usuario no encontrado',
            });
        }

        return res.status(200).json(updatedUser);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Error al actualizar al usuario',
            error: error.message,
        });
    }
};


const disableUser = async (req = request, res = response) => {
    const { _id } = req.params;
    const { banEndDate } = req.body;
    try {
        const user = await User.findByIdAndUpdate(_id, { status: 'Inactive', banEndDate }, { new: true });
        if (!user) {
            return res.status(404).json({
                message: "Usuario no encontrado"
            });
        }
        return res.status(200).json(user);
    } catch (error) {
        console.log(error.message, error);
        res.status(500).json({
            message: 'Error al eliminar al usuario',
            error
        });
    }
}

const updateUserProfilePicture = async (req = request, res = response) => {
    const { _id } = req.params;
    try {
        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).json({
                message: "Usuario no encontrado"
            });
        }

        if (!req.file) {
            return res.status(404).json({
                message: "No se ha enviado una imagen"
            });
        }

        // Construir la URL completa
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const imageUrl = `${baseUrl}/${req.file.path.replace(/\\/g, '/')}`;

        user.profilePicture = imageUrl;
        await user.save();

        res.json({
            message: 'Foto de perfil actualizada',
            profilePicture: user.profilePicture
        });
    } catch (error) {
        console.log(error.message, error);
        res.status(500).json({
            message: 'Error al actualizar la foto de perfil',
            error
        });
    }
}

const updateUserPassword = async (req = request, res = response) => {
    const { _id } = req.params;
    const { password } = req.body;
    try {
        const user = await User.findById(_id);
        if (!user) {
            return res.status(400).json({
                message: "Usuario no encontrado"
            });
        }

        if (password) {
            const salt = bcrypt.genSaltSync();
            const hashedPassword = bcrypt.hashSync(password, salt);
            user.password = hashedPassword;
        }

        await user.save();

        res.json({
            message: 'Contraseña actualizada',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture
            }
        });
    } catch (error) {
        console.log(error.message, error);
        res.status(500).json({
            message: 'Error al actualizar la contraseña',
            error
        });
    }
}

const followUser = async (req, res) => {
    const { _id } = req.params;
    const { userId } = req.body;

    try {
        if (_id === userId) {
            return res.status(400).json({ message: "No puedes seguirte a ti mismo" });
        }

        const userToFollow = await User.findById(_id);
        const followerUser = await User.findById(userId);

        if (!userToFollow || !followerUser) {
            return res.status(404).json({ message: "Usuario(s) no encontrado(s)" });
        }

        const alreadyFollowing = await UserFollower.findOne({
            user: _id,
            follower: userId
        });

        if (alreadyFollowing) {
            return res.status(400).json({ message: "Ya sigues a este usuario" });
        }

        const newFollow = new UserFollower({
            user: _id,
            follower: userId
        });

        await newFollow.save();

        await User.updateOne({ _id }, { $inc: { followers: 1 } });

        return res.status(200).json({ message: "Usuario seguido correctamente" });

    } catch (error) {
        console.error("Error al seguir usuario:", error);
        return res.status(500).json({ message: "Error interno al seguir al usuario" });
    }
};

const unfollowUser = async (req, res) => {
    const { _id } = req.params;
    const { userId } = req.body;

    try {
        if (_id === userId) {
            return res.status(400).json({ message: "No puedes dejar de seguirte a ti mismo" });
        }

        const userToFollow = await User.findById(_id);
        const followerUser = await User.findById(userId);

        if (!userToFollow || !followerUser) {
            return res.status(404).json({ message: "Usuario(s) no encontrado(s)" });
        }

        const alreadyFollowing = await UserFollower.findOne({
            user: _id,
            follower: userId
        });

        if (!alreadyFollowing) {
            return res.status(400).json({ message: "No sigues a este usuario" });
        }

        // 1. Elimina la relación de seguimiento
        await UserFollower.findOneAndDelete({
            user: _id,        // el usuario al que se seguía
            follower: userId  // el que lo seguía
        });

        // 2. Resta 1 a la cantidad de seguidores
        await User.updateOne({ _id }, { $inc: { followers: -1 } });

        // 3. Responde
        return res.status(200).json({ message: "Usuario dejado de seguir correctamente" });


    } catch (error) {
        console.error("Error al seguir usuario:", error);
        return res.status(500).json({ message: "Error interno al seguir al usuario" });
    }
};

const getFollowersByUserId = async (req, res) => {
    const { _id } = req.params;

    try {
        const followers = await UserFollower.find({ user: _id })
            .populate('follower', 'name')
            .select('follower');


        return res.status(200).json({
            followers
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al obtener seguidores',
            error: error.message
        });
    }
};

const getProfilePicture = async (req, res) => {
    const { _id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).json({ message: "ID no válido" });
    }

    try {
        const user = await User.findById(_id);

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        if (!user.profilePicture) {
            return res.status(404).json({ message: "Usuario no tiene foto de perfil" });
        }

        const imagePath = path.resolve(__dirname, '../../', user.profilePicture.replace(/\\/g, '/'));

        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({ message: "Archivo de imagen no encontrado en el servidor" });
        }

        return res.sendFile(imagePath);

    } catch (error) {
        return res.status(500).json({ message: "Error interno al obtener imagen", error: error.message });
    }
};

const register = async (req = request, res = response) => {
    const { name, email, password, role } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "El correo ya está registrado" });
        }

        const salt = bcrypt.genSaltSync();
        const hashedPassword = bcrypt.hashSync(password, salt);

        const newUser = new User({ name, email, password: hashedPassword, role });
        await newUser.save();

        res.json({
            message: "Usuario creado correctamente",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                status: newUser.status,
            }
        });

    } catch (error) {
        console.log(error.message, error);
        res.status(500).json({
            message: "Error al crear el usuario",
            error
        });
    }
};


module.exports = {
    getUserById,
    getUsers,
    updateUser,
    disableUser,
    updateUserProfilePicture,
    updateUserPassword,
    followUser,
    unfollowUser,
    getFollowersByUserId,
    getProfilePicture,
    register
}