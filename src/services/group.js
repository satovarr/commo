const Group = require('../models/Group'); 
const {joinWhatsappGroup} = require('./whatsapp');

async function getGroups(userId) {
    const groups = await Group.find({ admin: userId });
    return groups;
} 


module.exports = {
    getGroups,
}