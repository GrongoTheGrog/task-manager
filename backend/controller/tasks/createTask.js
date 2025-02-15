const mongoose = require('mongoose');
const Task = require('../../models/Task');
const User = require('../../models/User');


const createTask = async (req, res) => {

    const {
        description,
        name, 
        date,
        deadline,
        team,
        tags
    } = req.body;

    console.log(req.body);

    if (!description || !name || !team) return res.status(400).json({"error": "Description, name and team required"});

    const userId = await User.findOne({username: req.user}).select('_id');

    const task = Task.create({
        name, 
        description,
        date,
        deadline,
        author: userId._id,
        team,
        tags: tags
    })

    res.json(JSON.stringify(task));
}

module.exports = createTask;