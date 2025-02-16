const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/logout', async (req, res) => {
    const refreshToken = req.cookies.jwtRefresh;
    res.clearCookie('jwtRefresh', {maxAge: 15 * 24 * 60 * 60 * 1000, secure: false, httpOnly: true});

    const update = await User.findOneAndUpdate({refreshToken}, {refreshToken: null}, {returnDocument: 'after'});

    console.log(update);
    res.json(update);
})

module.exports = router;