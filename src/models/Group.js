const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    maxPoints: {
        type: Number,
        required: true,
        default: 5
    },
    admin: {
        type: String,
        required: false
    },
});

const Group = mongoose.model('groups', groupSchema);

module.exports = Group;