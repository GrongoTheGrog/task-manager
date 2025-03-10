const Task = require('../../models/Task');
const User = require('../../models/User');
const mongoose = require


const editTask = async (req, res) => {
    const {id, description, name, deadline, tags, status, priority, to} = req.body;

    if (!id) return res.status(400).json({"error": "Missing information."});

    const task = await Task.findByIdAndUpdate(id, {name, description, deadline, tags, status, priority, to}, {returnDocument: "after"});
    res.json(task);
}

module.exports = editTask;