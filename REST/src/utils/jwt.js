const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '1h'
        }, (error, token) => {
            if (error) {
                console.log(error);
                reject('No se pudo generar el token');
            } else {
                resolve(token);
            }
        });
    });
}

module.exports = generateToken;