const Team = require('../../models/Team');
const User = require('../../models/User');
const Task = require('../../models/Task');
const TeamRequest = require('../../models/TeamRequest');
const mongoose = require('mongoose');

const deleteTeam = async (req, res) => {
    const {id} = req.body;
    if (!id) return res.status(400).json({"error": "Missing Id"});

    const teamData = await Team.findById(id)
    .populate({
        path: 'members',
        populate: {
            path: 'user'
        }
    })
    .exec();

    if (!teamData) return res.status(404).json({error: 'Unknown team id.'});

    const user = teamData.members.find(member => {
        return member.user._id === req.userId;
    });

    if (!user) return res.status(403).json({error: 'User is not on the team.'});

    if (!user.role.includes('Creator')) return res.status(403).json({error: 'You are not allowed to delete the team.'})


    const teamId = teamData._id;

    await User.updateMany(
        { teams: { $in: [teamId] }}, 
        { $pull: {teams: teamId} }
    );

    await Task.deleteMany(
        {team: teamId}
    );

    await TeamRequest.deleteMany(
        {team: teamId}
    );


    const team = await Team.findByIdAndDelete(id).exec();
    res.json(team);
}

module.exports = deleteTeam;