const Task = require('../../models/Task');


const finish = async (req, res) => {
    const {id} = req.body;

    console.log(id)

    if (!id) return res.status(400).json({"error": "Missing information."});

    const task = await Task.findById(id);

    if (!task) return res.status(404).json({"error": "Task not found."});

    task.done = !task.done;

    await task.save();

    res.json(task);
}

module.exports = finish;