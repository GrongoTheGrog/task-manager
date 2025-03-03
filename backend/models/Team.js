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
                        'members:invite',
                        'members:promote',
                        'members:remove',
                        'task:finish'
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
    }
})

module.exports = mongoose.model('Team', Team);
