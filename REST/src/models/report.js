const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reason : {
        type : String,
        required : true
    },
    status : {
           type: String,
           required : true,
           enum: ['Pending', 'Checked', 'Sanctioned'],
           default: 'Pending'
    },
    post : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
    },
    answer : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Answer',
    },
    reporter : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
