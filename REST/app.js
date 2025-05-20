const express = require('express');
const mongoose = require('mongoose');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./src/config/swagger');
require('dotenv').config();

app.use(express.json());

const mongoDataBaseURI = 'mongodb://localhost:27017/questhubDB';
mongoose.connect(mongoDataBaseURI)
.then(() => console.log('Connecting to DataBase'))
.catch(error => console.error('Couldn`t connect database', error));

app.use('/api/users', require('./src/routes/users'));
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/categories', require('./src/routes/categories'));
app.use('/api/posts', require('./src/routes/posts'));
app.use('/api/answers', require('./src/routes/answers'));
app.use('/api/ratings', require('./src/routes/ratings'));
app.use('/api/reports', require('./src/routes/reports'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(3033, () => {
    console.log('Server running in http://localhost:3033');
})
