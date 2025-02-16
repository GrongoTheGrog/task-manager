const User = require('../../models/User');
const Task = require('../../models/Task');
const { default: mongoose } = require('mongoose');

const getTasksTeam = async (req, res) => {
    const teamId = req.body.id; 

    if (!teamId) return res.status(400).json({"error": "Missing id."});

    const tasks = await Task.find({team: teamId}).populate('team author').exec();

    res.json(tasks);
}

module.exports = getTasksTeam;