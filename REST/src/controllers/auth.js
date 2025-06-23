const { request, response } = require("express");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/jwt");

const User = require("../models/user");

const register = async (req = request, res = response) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "El correo ya está registrado" });
        }

        const salt = bcrypt.genSaltSync();
        const hashedPassword = bcrypt.hashSync(password, salt);

        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.json({
            message: `Bienvenido ${newUser.name}`,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                profilePicture: newUser.profilePicture,
                role: newUser.role,
                status: newUser.status,
                followers: newUser.followers,
                banEndDate: newUser.banEndDate
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

const login = async (req = request, res = response) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "El correo no está registrado"
            });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({
                message: "La contraseña no es correcta"
            });
        }

        const payload = {
            id: user._id,
            name: user.name,
        };

        const token = await generateToken(payload);
        res.header("x-token", token);
        res.json({
            message: `Bienvenido ${user.name}`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profilePicture: user.profilePicture,
                role: user.role,
                status: user.status,
                followers: user.followers,
                banEndDate: user.banEndDate
            }
        });
    } catch (error) {
        console.error(error.message, error);
        res.status(500).json({
            message: "Error al iniciar sesión",
            error
        });
    }
};

module.exports = {
    register,
    login
}