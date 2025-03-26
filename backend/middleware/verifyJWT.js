const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyJWT = async (req, res, next) => {
    const auth = req.headers.authorization || req.headers.Authorization;

    const cookies = req.cookies;

    console.log(cookies);

    if (!cookies?.jwtRefresh || !auth) return res.status(400).json({"error": "Missing information."});

    const refreshToken = cookies.jwtRefresh;
    const accessToken = auth.split(' ')[1];

    const matching = await User.findOne({refreshToken}).exec();

    if (!matching) return res.status(404).json({"error": "Unkown token."});

    jwt.verify(
        accessToken, 
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err){
                console.log(err);
            }
            if (err) return res.status(401).json({"error": "Invalid access token, go get another one."});
            if (decoded.id !== matching._id.toString()) return res.status(401).json({"error": "Missing cookies."});

            req.userId = decoded.id;
            req.roles = decoded.roles;
            next()

        }
    )
}

module.exports = verifyJWT;