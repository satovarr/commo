const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    id: { type: String, required: true }, // Unique identifier from Auth0
    displayName: {type: String, required: true},
    picture: String,
    email: String,
    linkedGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'groups' }], // Reference to Group model
});

const User = mongoose.model('Users', userSchema);

module.exports = User;
