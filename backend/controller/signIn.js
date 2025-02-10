const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User')
const router = express.Router();


router.post('/signin', async (req, res) => {
    const {username, password} = req.body;

    if (!username || !password) return res.status(400).json({"error": "Missing username or password."});

    try{
        const hashPassword = await bcrypt.hash(password, 10);

        const matching = await User.findOne({username}).exec();
        if (matching) return res.status(409).json({"error": "Username alredy used, choose another."});

        const user = User.create({
            username, password: hashPassword
        })

        res.json(user);

    }catch (err) {
        res.status(500).json({"error": err.message});
    }
})

module.exports = router;