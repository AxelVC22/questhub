const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        default: 'https://i.imgur.com/WxNkK7J.png'
        // type: mongoose.Schema.Types.ObjectId,
        // ref: 'fs.files',
    },
    role: {
        type: String,
        required: true,
        enum: ['user', 'moderator', 'admin'],
        default: 'user'
    },
    status : {
        type : String,
        required : true,
        enum : ['Active', 'Inactive'],
        default : 'Active'
    },
    banEndDate : {
        type : Date,
        default : null
    },
    followers : {
        type : Number,
        required : true,
        default : 0
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
