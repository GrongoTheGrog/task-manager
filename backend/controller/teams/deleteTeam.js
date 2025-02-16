const Team = require('../../models/Team');
const User = require('../../models/User');
const mongoose = require('mongoose');

const deleteTeam = async (req, res) => {
    const {id} = req.body;
    if (!id) return res.status(400).json({"error": "Missing Id"})

    const teamId = new mongoose.Types.ObjectId(id);
    console.log(teamId)

    await User.updateMany(
        { teams: { $in: [teamId] }}, 
        { $pull: {teams: teamId} }
    );
    const team = await Team.findByIdAndDelete(id);
    res.json(team);
}

module.exports = deleteTeam;