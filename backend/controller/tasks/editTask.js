const Task = require('../../models/Task');
const User = require('../../models/User');
const io = require('../../server');


const editTask = async (req, res) => {
    const {id, description, name, deadline, tags, status, priority, to} = req.body;

    if (!id) return res.status(400).json({"error": "Missing information."});

    const task = await Task.findByIdAndUpdate(id, {name, description, deadline, tags, status, priority, to}, {returnDocument: "after"}).populate('team author to');
    res.json(task);

    if (task?.team) {
        io.to(task.team._id.toString()).emit('edit-task', task);
        console.log('sent to team ' + task.team._id.toString());
    }
}

module.exports = editTask;