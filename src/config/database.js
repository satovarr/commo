const mongoose = require('mongoose');
require('dotenv').config();

async function connect() {
    await mongoose.connect(process.env.MONGODB_URI);
    return mongoose;
}

module.exports = connect;