const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyJWT = async (req, res, next) => {
    const auth = req.headers.authorization || req.headers.Authorization;
    
    const cookies = req.cookies;

    if (!cookies?.jwtRefresh) return res.status(400).json({"error": "Missing cookies."});

    const refreshToken = cookies.jwtRefresh;
    const accessToken = auth.split(' ')[1];

    const matching = await User.findOne({refreshToken}).exec();

    if (!matching) return res.status(401).json({"error": "Unkown token."});

    jwt.verify(
        accessToken, 
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) {
                jwt.verify(
                    refreshToken,
                    process.env.REFRESH_TOKEN_SECRET,
                    (err, decoded) => {
                        if (err) return res.status(401).json({"error": "Invalid token."});

                        const accessToken = jwt.sign(
                            {username, roles},
                            process.env.ACCESS_TOKEN_SECRET,
                            {expiresIn: '240s'}
                        )

                        
                    }
                )
            }else {
                req.user = decoded.username;
                req.roles = decoded.roles;
            };

        }
    )
}

module.exports = verifyJWT;