const Task = require('../../models/Task');


async function getTaskById(req, res){
    const {taskId} = req.body;

    if(!taskId) return res.status(400).json({error: 'Missing id'});

    try{
        const task = await Task.findById(taskId).populate('team to author');

        if(!task) return res.status(404).json({error: 'Task not found.'});

        res.json(task);
    }catch(err){
        res.status(500).json({error: err.message});
    }
}

module.exports = getTaskById;