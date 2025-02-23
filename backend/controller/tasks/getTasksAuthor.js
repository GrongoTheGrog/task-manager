const User = require('../../models/User');
const Task = require('../../models/Task');
const { default: mongoose } = require('mongoose');

const getTasksAuthor = async (req, res) => {

    if (!req?.user) return res.status(400).json({error: "Missing username on headers."});

    const user = await User.findOne({username: req.user}).select('_id').exec();

    const tasks = await Task.find({$or: [{author: user._id}, {to: user._id}]}).populate('team author to').exec();

    res.json([...tasks]);
}

module.exports = getTasksAuthor;