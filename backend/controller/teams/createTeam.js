const Team = require('../../models/Team');
const User = require('../../models/User');

const createTeam = async (req, res) => {
    const {name, description} = req.body;

    if (!name) return res.status(400).json({"error": "Missing name."});

    const matching = await User.findById(req.userId).exec();
    
    const team = new Team({
        name, 
        description, 
        members: {
            user: matching._id,
            role: [
                'Creator',
                'Admin',
                'Member'
            ]
        }
    });

    await team.save();

    matching.teams.push(team.id);
    await matching.save();

    res.json(team);
}

module.exports = createTeam;