const Task = require('../../models/Task');

const deleteTask = async (req, res) => {
    const {id} = req.body;
    console.log(id)

    if (!id) return res.status(400).json({"error": "Missing id to delete."});

    const task = await Task.findByIdAndDelete(id).exec();
    
    res.json(task);
}

module.exports = deleteTask;