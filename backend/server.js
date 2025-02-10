const express = require('express');
const app = express();
const {createServer} = require('http');
const server = createServer(app);
require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = require('./config/DBconn');

//connect to the database
connectDB();

//parse the cookie
app.use(require('cookie-parser'));

//json parser for requests
app.use(express.json());

//sign in controller
app.use(require('./controller/signIn'));
//log in controller
app.use(require('./controller/logIn'))




//check for DB connection, then listens
mongoose.connection.once('open', () => {
    server.listen(9000, () => {
        console.log('server connected on port 9000')
    })
})
