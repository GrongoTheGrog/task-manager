const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async (req, res) => {
    try{
        await mongoose.connect(process.env.DATABASE_URI, { useNewUrlParser: true, useUnifiedTopology: true });

        console.log('server connected to database');
    }catch(err) {
        console.log(err.message);
        process.exit(1);
    }
    
}

module.exports = connectDB;

