const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({

    content : {
        type : String,
        required : true
    },
    status : {
       type: String,
       required : true,
       enum: ['Active', 'Inactive'],
       default: 'Active'
    },
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
    totalRatings : {
        type : Number,
        required : true,
        default : 0
    },
    post : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
    },
    parentAnswer : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Answer',
    }
}, { timestamps: true });

module.exports = mongoose.model('Answer', answerSchema);
