const Team = require('../../models/Team');
const User = require('../../models/User');

const getTeams = async (req, res) => {
    const user = await User.findById(req.userId)
        .select('teams')
        .populate({
            path: 'teams',
            populate: {
                path: 'members',
                populate: {
                    path: 'user'
                }
            }
        })
        .exec();


    res.json(user.teams);
}

module.exports = getTeams;