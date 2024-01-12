const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: false
    },
    maxPoints: {
        type: Number,
        required: true,
        default: 5
    }
});

const Group = mongoose.model('groups', groupSchema);
