const model = require("../model/User");
const crypto = require("crypto");
const jwt = require('jsonwebtoken');
const { sanatizeUser } = require("../services/Common");
const User = model.User;

exports.createUser = async (req, res) => {
  try {
    const salt = crypto.randomBytes(16);
    crypto.pbkdf2(
      req.body.password,
      salt,
      310000,
      32,
      "sha256",
      async function (err, hashedPassword) {
        const user = new User({...req.body,salt,password:hashedPassword});
        const doc = await user.save();
        req.login(sanatizeUser(doc),(err)=>{
          if(err){
            res.status(400).json(err);
          }
          const token = jwt.sign(sanatizeUser(user), process.env.SECRET_KEY);
          res.cookie('jwt', token, { expires: new Date(Date.now() + 3600000), httpOnly: true })
          .status(201).json(token);
        })
       
      }
    );
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.loginUser = async (req, res) => {
  res.cookie('jwt', req.user.token, { expires: new Date(Date.now() + 3600000), httpOnly: true })
  .status(201).json(req.user.token);
};

exports.checkUser = async (req, res) => {
  res.json({status:'success',user:req.user});
};
