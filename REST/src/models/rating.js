const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    qualification : {
        type : Number,
        required : true,
        default : 0
    },
    answer : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Answer',
    }
}, { timestamps: true });

module.exports = mongoose.model('Rating', ratingSchema);
