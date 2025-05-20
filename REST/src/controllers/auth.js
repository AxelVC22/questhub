const { request, response } = require("express");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/jwt");

const User = require("../models/user");

const register = async (req = request, res = response) => {
    const { name, email, password } = req.body;
    try {
        const user = await User.findOne({email});
        if (user) {
            return res.status(400).json({
                message: "El correo ya esta registrado"
            });
        }
        const newUser = new User({ name, email, password });
        await newUser.save();
        res.json({
            message: `El usuario con el correo ${email} ha sido creado`,
            user: newUser
        });
    } catch (error) {
        console.log(error.message, error);
        res.status(500).json({
            message: "Error al crear el usuario",
            error
        });
    }
} 

const login = async (req = request, res = response) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({email, password}).select('-password -__v');
        if (!user) {
            return res.status(404).json({
                message: "El correo no esta registrado"
            });
        }

        // const validPasswword = await  bcrypt.compare(password, user.password);
        // if (!validPasswword) {
        //     return res.status(400).json({
        //         message: "La contraseña no es correcta"
        //     });
        // }

        const payload = {
            id: user._id,
            name: user.name,
        }

        const token = await generateToken(payload);
        res.header("x-token", token);
        res.json({
            message: `Bienvenido ${user.name}`,
            user
        });

    } catch (error) {
        console.log(error.message, error);
        res.status(500).json({
            message: "Error al iniciar sesion",
            error
        });
    }
}

module.exports = {
    register,
    login
}