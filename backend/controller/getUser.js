const express = require('express');
const User = require('../models/User');
const router = express.Router();

async function getUser(req, res){

    const {user} = req.body;

    if (!user) return res.status(400).json({error: 'Missing user email or name.'});

    const matching = await User.findOne({ $or: [{email: user}, {username: user}]}).exec();

    if (!matching) return res.status(404).json({error: 'User not found.'});

    res.status(200).json(matching);
}

router.post('/getUser', getUser);

module.exports = router;
