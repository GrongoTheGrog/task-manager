const User = require('../../models/User');
const Task = require('../../models/Task');
const { default: mongoose } = require('mongoose');

const getTasksTeam = async (req, res) => {
    const teamId = req.body.id; 

    let tasks;
    if (teamId){
        tasks = await Task.find({team: teamId}).populate('team author to').exec();
    }else{
        tasks = await Task.find({team: null}).populate('team author to').exec();
    }


    res.json(tasks);
}

module.exports = getTasksTeam;