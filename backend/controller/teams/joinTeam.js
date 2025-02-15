const User = require('../../models/User');
const Team = require('../../models/Team');
const mongoose = require('mongoose');

const joinTeam = async (req, res) => {
    const {id} = req.body;
    if (!id) return res.status(400).json({"error": "Missing Id"})

    const teamId = new mongoose.Types.ObjectId(id);

    const matchingTeam = await Team.findById(teamId).exec();
    if (!matchingTeam) return res.status(409).json({"error": "Couldnt find requested team."})

    const user = await User.findOne({username: req.user});

    if (!user) {
        return res.status(404).json({ "error": "User not found" });
    }

    if (user.teams.includes(teamId)) return res.status(409).json({"error": "User alredy on required team."});

    user.teams.push(teamId);
    await user.save();

    res.send(user)
}

module.exports = joinTeam;