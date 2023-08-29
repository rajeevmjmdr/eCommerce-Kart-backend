const passport = require("passport");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASS,
  },
});

exports.isAuth = (req, res, done) => {
  return passport.authenticate('jwt');
}

exports.sanatizeUser = (user)=>{
    return ({id:user.id,role:user.role})
}

exports.cookieExtractor = function(req) {
  var token = null;
  if (req && req.cookies) {
      token = req.cookies['jwt'];
  }
  return token;
};

exports.sendMail = ({to,subject,text,html})=>{
    const info = transporter.sendMail({
      from: '"eKart" <eKart.gmail.com>', // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      text: text, // plain text body
      html: html, // html body
    });
  
    return info;
  
}
