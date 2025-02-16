const {Schema, default: mongoose} = require('mongoose');


const User = new Schema({
    username: {
        type: String,
        require: true
    },

    password: {
        type: String,
        require: true
    },

    roles: {
        User: {
            type: Number,
            default: 0
        },

        Editor: Number,
        Admin: Number
    },

    refreshToken: String,

    email: {
        type: String, 
        require: true
    },

    teams: [{type: mongoose.Schema.Types.ObjectId, ref: "Team"}],

    profilePicture: String
});


module.exports = mongoose.model('User', User);