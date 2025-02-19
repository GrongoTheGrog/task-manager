const { findById } = require('../../models/Task');
const Team = require('../../models/Team');


async function getOneTeam(req, res){
    const teamId = req.body;
    console.log('teamId: ', teamId)

    if (!teamId) return res.status(400).json({error: 'Missing id.'});

    const team = await Team.findById(teamId.id).populate('members').exec();


    res.json(team)
}

module.exports = getOneTeam;