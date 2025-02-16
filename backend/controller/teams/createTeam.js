const Team = require('../../models/Team');
const User = require('../../models/User');

const createTeam = async (req, res) => {
    const {name, description} = req.body;
    console.log(req.user);

    if (!name) return res.status(400).json({"error": "Missing name."});

    const matching = await User.findOne({username: req.user}).exec();
    
    const team = await Team.create({name, description, members: matching._id});

    matching.teams.push(team.id);
    await matching.save();

    res.json(team);
}

module.exports = createTeam;