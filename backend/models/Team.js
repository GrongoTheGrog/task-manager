const mongoose = require('mongoose');


const Team = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    description: String,

    members: [{
        user: {        
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: Map,
            of: Number
        }
    }],

    possibleRoles: {
        type: Map,
        of: Number
    }
})

module.exports = mongoose.model('Team', Team);