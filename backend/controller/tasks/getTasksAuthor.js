const User = require('../../models/User');
const Task = require('../../models/Task');
const { default: mongoose } = require('mongoose');

const getTasksAuthor = async (req, res) => {

    if (!req?.user) return res.status(400).json({error: "Missing username on headers."});

    const user = await User.findOne({username: req.user}).exec();

    const tasks = await Task.find({team: { $in: user.teams}}).populate('team author to').exec();
    const noTeamQuests = await Task.find({author: user._id, team: null});
    

    res.json([...tasks, ...noTeamQuests]);
}

module.exports = getTasksAuthor;