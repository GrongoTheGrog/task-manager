const express = require('express');
const router = express.Router();
const TeamRequest = require('../../models/TeamRequest');
const User = require('../../models/User');


async function getReq(req, res){
    try{
        const user = await User.findOne({username: req.user}).exec();
        const teamRequests = await TeamRequest.find({to: user._id}).populate('team to from').exec();

        res.json(teamRequests);

    }catch(err){
        res.status(500).json({error: err.message})
    }
}


module.exports = getReq;