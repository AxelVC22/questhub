const swaggerJSDoc = require('swagger-jsdoc');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'QuestHub API',
            version: '1.0.0',
            description: 'API para una plataforma de preguntas y respuestas para la facultad de estadistica e informatica',
        },
        servers: [
            {
                url: 'http://localhost:3033',
                description: 'Servidor de desarrollo',
            },
        ],
    },
    apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

module.exports = swaggerSpec;