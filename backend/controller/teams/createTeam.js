const Team = require('../../models/Team');
const User = require('../../models/User');

const createTeam = async (req, res) => {
    const {name, description} = req.body;
    console.log(req.user);

    if (!name) return res.status(400).json({"error": "Missing name."});
    
    const team = await Team.create({name, description});

    const matching = await User.findOneAndUpdate({username: req.user}, { $push: {teams: team._id}}, {returnDocument: "after"}).exec();
    res.json(matching);
}

module.exports = createTeam;