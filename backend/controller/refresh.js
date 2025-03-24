const jwt = require('jsonwebtoken');
const User = require('../models/User');
const express = require('express');
const router = express.Router();

router.get('/refresh', async (req, res) => {
    const jwtRefresh = req.cookies.jwtRefresh;

    if (!jwtRefresh) return res.status(400).json({"error": "Missing cookies."});
    const matching = await User.findOne({refreshToken: jwtRefresh}).exec();
    if (!matching) return res.status(404).json({"error": "Unknown token."});   


    jwt.verify(
        jwtRefresh, 
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if (err || decoded.id !== matching._id.toString()) return res.status(403).json({"error": "Invalid token."});

            const accessToken = jwt.sign(
                {id: matching._id.toString(), roles: decoded.roles},
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn: '120s'}
            )


            User.findById(decoded.id).select('username teams email profilePicture')
            .then(user => {
                console.log(user);
                res.json({
                    user,
                    token: accessToken
                })  
            })
        }
    )
})



module.exports = router;