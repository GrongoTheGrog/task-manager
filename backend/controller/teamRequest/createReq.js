const TeamRequest = require('../../models/TeamRequest');
const User = require('../../models/User');

const createTeamRequest = async (req, res) => {
    try{
        const {to, team} = req.body;

        if (!to || !team) return res.status(400).json({error: "Missing to, from or team for creating the team request."});

        const id = await User.findOne({username: req.user}).select('_id');

        const from = id._id;

        const matching = await TeamRequest.findOne({to, from, team}).exec();
        if (matching) return res.status(409).json({error: "User alredy has a request to that destination for that team."});

        const teamRequest = await TeamRequest.create({to, from, team});

        res.json(teamRequest);
    }catch(err){
        console.log(err.message);
        return res.status(500).json({error: err.message});
    }
}

module.exports = createTeamRequest;