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
        role: [{
            type: String,
            default: ['Member']
        }]
    }],

    possibleRoles: {
        type: Map,
        of: Object,
        default: new Map([
            ['Creator', 
                {
                    level: 100,
                    permissions: [
                        'task:create',
                        'task:accept',
                        'task:delete',  
                        'team:delete',
                        'task:finish',
                        'members:invite',
                        'members:promote',
                        'members:remove',
                    ]
                }
            ],
            ['Admin', 
                {
                    level: 76,
                    permissions: [
                        'task:create',
                        'task:accept',
                        'task:delete',
                        'members:promote',
                        'task:finish'
                    ]
                }
            ],
            ['Member', 
                {
                    level: 1,
                    permissions: [
                        'task:finish'
                ]
            }]
        ])
    },

    possiblePriorities: {
        Urgent: {
            type: Number,
            default: 100
        },
        ['Very High']: {
            type: Number,
            default: 87
        },
        High: {
            type: Number,
            default: 75
        },
        Medium: {
            type: Number,
            default: 50
        },
        Low: {
            type: Number,
            default: 25
        },
        ['Very Low']: {
            type: Number,
            default: 17
        }
    }
})

module.exports = mongoose.model('Team', Team);
