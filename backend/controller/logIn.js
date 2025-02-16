const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User')
const router = express.Router();


router.post('/login', async (req, res) => {
    const {username, password, email} = req.body;

    if (!username || !password || !email) return res.status(400).json({"error": "Missing username, password or email."});

    try{
        const matching = await User.findOne({username, email}).exec();
        if (!matching) return res.status(404).json({"error": "Username not found."});

        const cryptPassword = await bcrypt.compare(password, matching.password);
        if (!cryptPassword) return res.status(401).json({"error": "Incorrect password or username."});

        const roles = matching.roles;

        const accessToken = jwt.sign(
            {username, roles: roles},
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn: '120s'}
        )

        const refreshToken = jwt.sign(
            {username, roles: roles},
            process.env.REFRESH_TOKEN_SECRET,
            {expiresIn: '30d'}
        )

        const update = await User.findOneAndUpdate({username}, {refreshToken}).select('username teams email profilePicture').exec();

        res.cookie('jwtRefresh', refreshToken, {maxAge: 15 * 24 * 60 * 60 * 1000, secure: false, httpOnly: true});
        
        res.json({
            accessToken,
            user: update
        });

    }catch (err) {
        res.status(500).json({"error": err.message});
    }
})

module.exports = router;