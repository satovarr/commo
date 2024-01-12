const mongoose = require('mongoose');
require('dotenv').config();


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

const participantSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: false
    },
    points: {
        type: Number,
        required: true,
        default: 0
    },
    pointsToday: {
        type: Number,
        required: true,
        default: 0
    },
    streak: {
        type: Number,
        required: true,
        default: 0
    },
    lastStreak: {
        type: Date,
        required: false,
        default: Date.now
    },
    
    group: {
        type: String,
        required: true
    }
});

const Participant = mongoose.model('participants', participantSchema);

module.exports = {
    Group,
    Participant
};