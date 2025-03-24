const nodeMailer = require('nodemailer');


const transporter = nodeMailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "taskifymessager@gmail.com",
        pass: process.env.EMAIL_KEY, 
    },
})

transporter.verify((error, success) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Server is ready to take our messages");
    }
  });


module.exports = transporter;