const User = require('../../models/User');
const Team = require('../../models/Team');
const io = require('../../server');
const mongoose = require('mongoose');

const leave = async (req, res) => {
    const {id, userId} = req.body;
    if (!id || !userId) return res.status(400).json({"error": "Missing Id"})

    const matchingTeam = await Team.findById(id).exec();
    if (!matchingTeam) return res.status(409).json({"error": "Couldnt find requested team."})

    const user = await User.findById(userId).populate('teams').exec();

    if (!user) {
        return res.status(404).json({ "error": "User not found" });
    }

    if (!user.teams.find(team => {
        return team._id.toString() === id;
    })) return res.status(409).json({"error": "User has alredy left the team."});


    matchingTeam.members = matchingTeam.members.filter(member => {

        return member.user._id.toString() !== user._id.toString();
    });

    user.teams = user.teams.filter(team => team._id.toString() !== id);


    await user.save();
    await matchingTeam.save();

    io.to(id).emit('leave-team', user);
    console.log('user ' + user.username + ' left team ' + id);

    res.send(user)
}

module.exports = leave;