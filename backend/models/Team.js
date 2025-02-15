const mongoose = require('mongoose');


const Team = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    description: String
})

module.exports = mongoose.model('Team', Team);