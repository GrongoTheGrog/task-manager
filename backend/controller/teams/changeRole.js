const express = require('express');
const app = express.Router();
const io = require('../../server');
const User = require('../../models/User');
const Team = require('../../models/Team');

async function changeRoles(req, res){
    const {changingId, targetRole, ownRole, teamId} = req.body;   //     role => {'Admin': 76}


    //verifies input
    if (!changingId || !ownRole || !teamId || !targetRole) return res.status(400).json({error: 'Missing information.'});


    //find the team so i can update later
    const team = await Team.findById(teamId).populate({
        path: 'members',
        populate: {
            path: 'user'
        }
    }).exec();

    //check if team exists
    if (!team) return res.status(404).json({error: 'Team not found.'});

    //save the role values
    const ownRoleValue = Object.values(ownRole)[0];
    const targetRoleValue = Object.values(targetRole)[0];


    //check if changing and user are reallu on the team
    const user = team.members.find(member => member.user.username === req.user);
    const changing = team.members.find(member => member.user._id === changingId);

    if(!user || !changing) return res.status(403).json({error: 'You or requested user are not on the team.'});

    if(!Object.values(user.role).includes(ownRoleValue)) return res.status(403).json({error: 'You do not have such role.'})
    
    //update the team member's roles
    if (ownRoleValue >= targetRoleValue && ownRoleValue >= 76){
        team.members.map(member => {
            if (member.user._id === changingId){
                return {
                    user: user._id,
                    role: {
                        ...targetRole,
                        ...member.role
                    }
                }
            }
            return member;
        });

        await team.save();
        res.json(team);
    }else{
        return res.status(403).json({error: "You can not change user to requested role"});
    }
}

module.exports = changeRoles;