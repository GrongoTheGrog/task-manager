const mongoose = require('mongoose');
const Task = require('../../models/Task');
const User = require('../../models/User');
const io = require('../../server');
const Team = require('../../models/Team');
console.log(io)


const createTask = async (req, res) => {

    const {
        description,
        name, 
        date,
        deadline,
        team,
        tags,
        to
    } = req.body;

    console.log(req.body);

    if (!description || !name) return res.status(400).json({"error": "Description, name and team required"});

    const userId = await User.findOne({username: req.user}).exec();

    if (team){
        const teamData = await Team.findById(team).populate({
            path: 'members',
            populate: {
                path: 'user'
            }
        }).exec();

        if (!teamData) return res.status(404).json({error: 'Team not found.'});



        const user = teamData.members.find((member) => {
            return member.user.username === req.user;
        });

        if (!user) return res.status(403).json({error: 'User not on the selected team.'})
    }


    const task = await Task.create({
        name, 
        description,
        date,
        deadline,
        author: userId._id,
        team,
        tags: tags,
        to
    });

    io.to(team).emit("create-task", task);

    res.json(task);
}

module.exports = createTask;