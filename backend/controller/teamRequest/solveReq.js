const TeamRequest = require('../../models/TeamRequest');
const User = require('../../models/User');

const solveReq = async (req, res) => {
    try{
        const {reqId, accept} = req.body;

        if (!reqId || !accept) return res.status(400).json({error: "Missing solve option or reqId."});

        if (accept){ 
            const teamRequest = await TeamRequest.findById(reqId).populate('to').exec();

            const teamId = teamRequest.team;
            const user = teamRequest.to;

            if (user.teams.includes(teamId)) return res.status(400).json({error: "User alredy in team."});

            user.teams.push(teamId);
            await user.save();
        }

        const deleteTeam = await TeamRequest.findByIdAndDelete(reqId).exec();

        res.json(deleteTeam);
    }catch(err){
        console.log(err.message);
        return res.status(500).json({error: err.message});
    }
}

module.exports = solveReq;