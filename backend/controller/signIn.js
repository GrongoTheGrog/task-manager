const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User')
const router = express.Router();
const cloudinary = require('../config/cloudinaryConn');
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


router.post('/edituser', upload.single('image'), verifyJWT, async (req, res) => {
    try{
        const {username, password, email} = req.body;

        let profilePicture;

        let hashPassword;

        if (password) {
            hashPassword = bcrypt.hash(password, 12);
        }

        if (req.file) {
            profilePicture = await cloudinary.uploader.upload(req.file.path);
            profilePicture = profilePicture.secure_url;
        }
        
        const user = await User.findByIdAndUpdate(req.userId, {username, password, email, profilePicture}, {returnDocument: "after"}).exec();

        if (username) {
            const accessToken = jwt.sign(
                {username, roles: user.roles},
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn: '240s'}
            )
    
            const refreshToken = jwt.sign(
                {username, roles: user.roles},
                process.env.REFRESH_TOKEN_SECRET,
                {expiresIn: '15d'}
            )

            user.refreshToken = refreshToken;
            await user.save();

            res.cookie('jwtRefresh', refreshToken, {maxAge: 15 * 24 * 60 * 60 * 1000, secure: false, httpOnly: true});
        
            return res.json(accessToken);
        }

        res.sendStatus(200);
    }catch(err) {
        res.status(500).json({error: err.message})
    }
})



module.exports = router;