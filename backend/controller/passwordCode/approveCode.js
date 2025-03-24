const transporter = require('../../config/nodeMailerConn');
const PassCode = require('../../models/PassCode');
const User = require('../../models/User');
const {format} = require('date-fns');


async function approveEmail(req, res){
    const {code, email} = req.body;

    if (!code || !email) return res.status(400).json({error: 'Missing code or email.'});

    try{
        const userMatch = await User.findOne({email}).exec();
        const codeMatch = await PassCode.findOne({user: userMatch._id}).exec();

        if (!codeMatch || codeMatch.code !== Number(code.trim())){
            return res.status(400).json({error: 'Invalid code.'});
        }

        if (new Date() > new Date(codeMatch.expiresAt)){
            return res.status(400).json({error: 'Code expired.'}); 
        }

        await PassCode.findByIdAndDelete(codeMatch._id).exec();

        res.send('Approved.');
    }catch(err){
        res.status(500).json({error: 'Server error, try again later'});
    }



}

module.exports = approveEmail;