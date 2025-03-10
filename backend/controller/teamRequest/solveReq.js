const TeamRequest =require('../../models/TeamRequest');
const User = require('../../models/User');
const io = require('../../server');

const solveReq = async (req, res) => {
    try{
        const {reqId, accept} = req.body;

        if (!reqId || accept === undefined) return res.status(400).json({error: "Missing solve option or reqId."});

        if (accept){ 
            const teamRequest = await TeamRequest.findById(reqId).populate('to team').exec();
            console.log(teamRequest);

            const team = teamRequest.team;
            const user = teamRequest.to;

            if (user.teams.includes(team._id)) return res.status(409).json({error: "User alredy in team."});


            team.members.push({
                user,
                role: [
                    'Member'
                ]
            })


            user.teams.push(team._id);
            await team.save();
            await user.save();

            io.to(team._id.toString()).emit('add-member', user);
            console.log('add-member emitted to team: ' + team._id.toString());
        }

        const deletedRequest = await TeamRequest.findByIdAndDelete(reqId).exec()
        console.log()

        res.json(deletedRequest);
    }catch(err){
        console.log(err.message);
        return res.status(500).json({error: err.message});
    }
}

module.exports = solveReq;