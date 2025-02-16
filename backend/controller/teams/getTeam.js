const Team = require('../../models/Team');
const User = require('../../models/User');

const getTeams = async (req, res) => {
    const user = await User.findOne({username: req.user})
        .populate('teams')
        .exec();

    res.json(user.teams);
}

module.exports = getTeams;