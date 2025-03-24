const mongoose = require('mongoose');

const Code = new mongoose.Schema({
    user: mongoose.Types.ObjectId,
    code: Number,
    expiresAt: Date,
    cooldown: Date
});

module.exports = mongoose.model('PassCode', Code);