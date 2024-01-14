const Group = require('../models/Group'); 
const router = require('express').Router();
const {joinWhatsAppGroup} = require('../services/whatsapp');
const {getGroups} = require('../services/group');

// Middleware for authentication
const authenticate = (req, res, next) => {
    if (req.headers.testsecret === process.env.TEST_SECRET) {
        req.user = {
            id: req.headers.testid,
        };
    };
    const userId = req.user?.id;
    if (!userId) {
        return res.status(403).send('Access denied.');
    }

    next();
};

router.use(authenticate);

// GET all Groups
router.get('/', async (req, res) => {
    const userId = req.user.id;
    try {
        res.send(await getGroups(userId));
    } catch (error) {
        res.status(500).send(error);
    }
});

// GET a single Group by ID
router.get('/:id', async (req, res) => {
    try {
        const group = await Group.findOne({id: req.params.id, admin: req.user.id});
        if (group.admin !== req.user.id) {
            return res.status(403).send('Access denied.');
        }
        if (!group) {
            return res.status(404).send();
        }
        res.send(group);
    } catch (error) {
        res.status(500).send(error);
    }
});

// POST a new Group
router.post('/', async (req, res) => {
    console.log(req.user)
    const {url, maxPoints} = req.body;
    const groupId = await joinWhatsAppGroup(url);
    const group = new Group({
        id: groupId,
        name: groupId,
        maxPoints,
        admin: req.user.id});
    try {
        await group.save();
        res.status(201).send(group);
    } catch (error) {
        res.status(400).send(error);
    }
});

// PUT (update) an Group by ID
router.put('/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    try {
        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).send();
        }
        updates.forEach((update) => group[update] = req.body[update]);
        await group.save();
        res.send(group);
    } catch (error) {
        res.status(400).send(error);
    }
});

// DELETE an Group
router.delete('/:id', async (req, res) => {
    try {
        const group = await Group.findByIdAndDelete(req.params.id);
        if (!group) {
            return res.status(404).send();
        }
        res.send(group);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
