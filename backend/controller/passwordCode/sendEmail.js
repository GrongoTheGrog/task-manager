const transporter = require('../../config/nodeMailerConn');
const PassCode = require('../../models/PassCode');
const User = require('../../models/User');
const {format} = require('date-fns');


async function sendCode(req, res){
    const {email} = req.body;

    if (!email) return res.status(400).json({error: 'Missing email.'});

    const userMatch = await User.findOne({email}).exec();
    if (!userMatch) return res.status(404).json({error: 'No user found with provided email.'});

    const passCode = await PassCode.findOne({user: userMatch._id}).exec();

    if (passCode && new Date(passCode?.cooldown) > new Date()){
        return res.status(429).json({error: 'Wait the 2 minutes cooldown between each code.'});
    }

    await PassCode.findOneAndDelete({user: userMatch._id}).exec();

    let code = Math.floor(Math.random() * 999999);


    await PassCode.create({
        user: userMatch,
        code,
        expiresAt: new Date(Date.now() + 20 * 60 * 1000),   ///expires in 20 MINUTES
        cooldown: new Date(Date.now() + 2 * 60 * 1000)      ///allow other codes in 2 MINUTES
    });

    transporter.sendMail({
        from: '"Taskify" <taskifymessager@gmail.com>',
        to: email,
        subject: "Reset password code.",
        text: `Your reset code is: ${code}
        
        Expires in 20 minutes.`
    })

    res.send('Mail sent.');
}


module.exports = sendCode;