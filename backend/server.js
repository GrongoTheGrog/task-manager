const express = require('express');
const app = express();
const {createServer} = require('http');
const server = createServer(app);
const WebSocket = require('ws')
const {Server} = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ["GET", "POST"],
        credentials: true 
        
    }
});
require('dotenv').config();
const mongoose = require('mongoose');
const verifyJWT = require('./middleware/verifyJWT');
const verifyRoles = require('./middleware/verifyRoles');
const SERVER_ROLES = require('./config/roles')
const cors = require('cors');
const cookieParser = require('cookie-parser');

//cors
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ["GET", "POST"],
    credentials: true
}))

//parse the cookie
app.use(cookieParser());

//json parser for requests
app.use(express.json());


app.use((req, res, next) => {
    res.io = io;
    next();
})


io.on("connection", async (socket) => {
    const id = socket.handshake.headers['id'];

    if (!id) {
        console.log('Missing user id.');
        return socket.disconnect(true);
    };

    const user = await User.findById(id).exec();
    user.socket = socket.id;
    await user.save();

    console.log('user connected: ', user.username);

    //join team
    socket.on('join-team', (teamId) => {  
        socket.join(teamId);      
        console.log('user ' + user.username + ' joined the team: ' + teamId);
        console.log(socket.rooms);
    })

    //leave team
    socket.on('leave-room', (teamId) => {
        socket.leave(teamId);

        console.log('user ' + user.username + ' left the team: ' + teamId);
    })

    socket.on('disconnect', async () => {
        user.socket = null;
        await user.save();
        console.log('user disconnected: ', socket.id);
    })
})  

module.exports = io;


const connectDB = require('./config/DBconn');
const { access } = require('fs');
const User = require('./models/User');


//connect to the database
connectDB();

app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.sendStatus(200);
})

//sign in controller
app.use(require('./controller/signIn'));

//log in controller
app.use(require('./controller/logIn'));

//refresh controller
app.use(require('./controller/refresh'));

//get user
app.use(require('./controller/getUser'));


//verify jwt
app.use(verifyJWT);

//teams router
app.use(require('./controller/teams/teamRouter'));

//tasks router
app.use(require('./controller/tasks/taskRouter'));

//team requests
app.use(require('./controller/teamRequest/teamRequestRouter'))



//logout controller 
app.use(require('./controller/logout'));

//test api call
app.get('/message', verifyRoles(SERVER_ROLES.User), (req, res) => {
    res.json({"message": "Hello World!"})
})


//check for DB connection, then listens
mongoose.connection.once('open', () => {
    server.listen(9000, () => {
        console.log('server connected on port 9000')
    })
})
