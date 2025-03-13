const express = require('express');
const app = express.Router();
const io = require('../../server');
const User = require('../../models/User');
const Team = require('../../models/Team');

async function changeRoles(req, res){
    const {userId, newRoles, teamId} = req.body;

    if (!userId || !newRoles || !teamId) return res.status(400).json({error: 'missing information'});

    try{
        const matchingTeam = await Team.findById(teamId).populate({
            path: 'members',
            populate: 'user'
        }).exec();

        if (!matchingTeam) return res.status(400).json({error: 'team not found.'});

        matchingTeam.members.forEach(member => {
            console.log(member.user._id.toString() === userId);
            if (member.user._id.toString() === userId) {
                member.role = newRoles;
            }
        });

        await matchingTeam.save();

        io.to(teamId).emit('edited-member', matchingTeam);
        return;
    }catch(err){    
        return res.status(500).json({error: err.message});
    }


}

module.exports = changeRoles;