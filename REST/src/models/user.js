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
        minlength: 8,
        maxlength: 100,
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
        enum: ['User', 'Moderator', 'Admin'],
        default: 'User'
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
