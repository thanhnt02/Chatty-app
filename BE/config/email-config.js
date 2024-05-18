const nodemailer = require('nodemailer') 
const dotenv  = require('dotenv')

dotenv.config(  )

const user = process.env.SECRET_USER, //Email address để gửi mail
      password = process.env.SECRET_PASSWORD //App password của email trên

const sendMail = async (from, to, subject, text, html) => {
    
    // Creating default SMTP transport method
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, 
        auth: {
        user: user,
        pass: password
        },
    });
    transporter.verify(function (error, success) {
        if (error) {
          console.log(error);
        } else {
          console.log("Server is ready to take our messages");
        }
      });
    // sending mail
    let info = await transporter.sendMail({
        from: from,
        to: to,
        subject: subject,
        text: text,
        html: html,
    });
}

module.exports = { sendMail};
