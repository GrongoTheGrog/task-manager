const { request } = require('express');
const TeamRequest = require('../../models/TeamRequest');
const User = require('../../models/User');
const io = require('../../server')

const createTeamRequest = async (req, res) => {
    try{
        const {to, team} = req.body;

        if (!to || !team) return res.status(400).json({error: "Missing to, from or team for creating the team request."});


        //get the id of who sends the message
        const id = await User.findOne({username: req.user}).select('_id');
        const from = id._id;


        const existingRequests = await Promise.all(
            to.map(user => TeamRequest.findOne({ user, from, team }).exec())
        )  

        const hasExisting = existingRequests.filter(request => request);

        if (hasExisting.length){
            return res.status(409).json({error: "You alredy have a request with the same destination."});
        }


        const requests = to.map(user => {
            return {
                to: user,
                from,
                team,
            }
        });


        console.log(requests)
        


        //creates all the requests
        const teamRequest = await TeamRequest.insertMany(requests);

        await Promise.all(
            teamRequest.map(async request => {
                await request.populate('to from team')
                const found = await User.findById(request.to);

                if (found?.socket){
                    io.to(found.socket).emit('create-req', request);
                    console.log('socket request sent')
                }
            })
        )



        res.json(teamRequest);
    }catch(err){
        console.log(err.message);
        return res.status(500).json({error: err.message});
    }
}

module.exports = createTeamRequest;