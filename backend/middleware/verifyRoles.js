const User = require('../models/User');

const verifyRoles = (...rolesList) => {
    return async (req, res, next) => {
        const {roles, user} = req;
        console.log(roles, '    ', user)

        if (!roles || !user) return res.status(500).json({"error": "couldnt find user or roles attatched to request, try again later"});

        const userRoles = Object.values(roles);

        const result = userRoles.map(role => rolesList.includes(role)).find(role => role === true);

        if (!result) return res.status(403).json({"error": "User doesn't have required role(s) for request."});

        next();
    }
}

module.exports = verifyRoles;