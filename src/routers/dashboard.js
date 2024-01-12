
const router = require('express').Router();
const UserModel = require('../models/User');


router.get('/dashboard', async (req, res) => {

    if (!req.isAuthenticated()) return res.redirect('/');
  
    // Fetch user and their groups from the database
    console.log(req.user)
    const user = req.user;
    res.render('dashboard', { user });
  });
  
module.exports = router;