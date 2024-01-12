const router = require('express').Router();

const { Group, User } = require('../models');

// GET /api/groups

// get groups for a user
router.get('/', async (req, res) => {
    const { user } = req;
    const groups = await Group.find({ admin: user.id });


})

// join group, create group in db and add admin to group
router.post('/', async (req, res) => {
    const { user } = req;
    const { whatsappGroupLink } = req.body;


})