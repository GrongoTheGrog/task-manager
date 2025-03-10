const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Team = require('../../models/Team');

async function getSortedMembers(req, res){
    const {teamId} = req.body;
    
    if(!teamId) res.status(400).json({error: 'Missing team id.'});

    try{
        const team = await Team.findById(teamId)
            .populate({
                path: 'members',
                populate: {
                    path: 'user'
                }
            })
            .exec();
        
        if (!team) res.status(404).json({error: 'Team not found'});

        const user = await User.findOne({username: req.user}).exec();

        if (!user.teams.includes(teamId)) res.status(403).json({error: 'User is not on the requested team.'});


        let members = team.members;   
        const {possibleRoles} = team;

        function getHighestRole(member){          //returns the role level
            let currentRole;

            member.role.forEach(role => {
                const number = possibleRoles.get(role);

                if (number > currentRole?.level || !currentRole) currentRole = possibleRoles.get(role);
            });

            return currentRole.level;
        }

        members.sort((a, b) => {
            const aLevel = getHighestRole(a);
            const bLevel = getHighestRole(b);

            return bLevel - aLevel;
        })

        res.json(members);
    }catch(err){
        res.status(500).json({error: err.message})
    }
}

module.exports = getSortedMembers;