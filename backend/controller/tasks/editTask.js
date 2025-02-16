const Task = require('../../models/Task');


const editTask = async (req, res) => {
    const {id, description, name, deadline, tags} = req.body;

    console.log(id)

    if (!id) return res.status(400).json({"error": "Missing information."});

    const task = await Task.findByIdAndUpdate(id, {name, description, deadline, tags}, {returnDocument: "after"});

    res.json(task);
}

module.exports = editTask;