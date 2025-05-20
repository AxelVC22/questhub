const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 50
    },
    description: {
        type: String,
        required: true,
        maxlength: 255
    },
    status : {
        type: String,
        required : true,
        enum: ['Active', 'Inactive'],
                default: 'Active'
    },

}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
