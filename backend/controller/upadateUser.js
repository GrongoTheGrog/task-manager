const User = require('../models/User');

async function updateUser(req, res){
    const {id, username, email} = req.body;

    if (!id) return res.status(400).json({error: 'Missing Id.'});

    const matching = await User.findOne({$or: [{username}, {email}]}).exec();

    console.log(matching);
    if (matching) return res.status(409).json({error: 'Alredy used choose another.'});

    console.log(req.body);  
    const user = await User.findByIdAndUpdate(id, {username, email}).exec();

    res.json(user);
}

module.exports = updateUser;