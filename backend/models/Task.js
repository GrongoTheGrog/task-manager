const mongoose = require('mongoose');


const Task = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    date: {
        type: Date,
        required: true,
        default: Date.now,
    },

    deadline: Date,

    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },

    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team"
    },

    tags: [{type: String}],

    done: {
        type: Boolean,
        default: false
    },

    to: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    priority: {
        type: Object,
        default: {
            Medium: 50
        }
    },

    status: {
        type: String,
        default: 'Todo'
    }
})

module.exports = mongoose.model('Task', Task);