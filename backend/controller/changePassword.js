const User = require('../models/User');
const bcrypt = require('bcrypt');

async function changePasswords(req, res){
    const {newPassword, email} = req.body;
    console.log(newPassword);
    console.log(email);

    if (!newPassword || !email) return res.status(400).json({error: 'Missing either new password or email.'});

    const userMatch = await User.findOne({email}).exec();

    if (!userMatch) return res.status(404).json({error: 'No user found with given email.'});

    console.log(userMatch.password);

    const samePassword = await bcrypt.compare(newPassword, userMatch.password);
    if (samePassword) return res.status(409).json({error: 'The new password must not be the same as your previous one.'});

    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    userMatch.password = newPasswordHash;

    await userMatch.save();

    res.send('Password created.');
}

module.exports = changePasswords;