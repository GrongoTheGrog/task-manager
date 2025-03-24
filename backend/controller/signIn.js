const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User')
const router = express.Router();
const multer = require('multer');
const verifyJWT = require('../middleware/verifyJWT');
const jwt = require('jsonwebtoken');

const upload = multer({dest: '/uploads'});


router.post('/signin', async (req, res) => {
    console.log('aaaa')
    const {username, password, email} = req.body;

    if (!username || !password, !email) return res.status(400).json({"error": "Missing username, password or email."});

    try{
        const hashPassword = await bcrypt.hash(password, 10);

        const matching = await User.findOne({$or: [{username}, {email}]}).exec();
        if (matching) return res.status(409).json({"error": "Username or email alredy used, choose another."});

        const user = User.create({
            username, password: hashPassword, email
        })

        res.json(user);

    }catch (err) {
        res.status(500).json({"error": err.message});
    }
})


module.exports = router;