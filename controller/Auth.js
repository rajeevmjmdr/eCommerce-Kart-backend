const model = require("../model/User");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { sanatizeUser, sendMail } = require("../services/Common");
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
        const user = new User({ ...req.body, salt, password: hashedPassword });
        const doc = await user.save();
        req.login(sanatizeUser(doc), (err) => {
          if (err) {
            res.status(400).json(err);
          }
          const token = jwt.sign(sanatizeUser(user), process.env.SECRET_KEY);
          res
            .cookie("jwt", token, {
              expires: new Date(Date.now() + 3600000),
              httpOnly: true,
            })
            .status(201)
            .json({ id: doc.id, role: doc.role });
        });
      }
    );
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.loginUser = async (req, res) => {
  res
    .cookie("jwt", req.user.token, {
      expires: new Date(Date.now() + 3600000),
      httpOnly: true,
    })
    .status(201)
    .json(req.user.token);
};

exports.checkAuth = async (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json("unAuthorized");
  }
};
exports.resetPasswordCheck = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email }).exec();
    if (user) {
      const token = crypto.randomBytes(48).toString("hex");
      user.resetPasswordToken = token;
      await user.save();
      const resetLink =
        "http://localhost:3000/reset-password?token=" +
        token +
        "&email=" +
        user.email;
      const to = user.email;
      const subject = "Reset Password";
      const text = "Reset Password for eKart";
      const html = `<p><a href=${resetLink}>Click the link </a> to reset password </p>`;
      const response = await sendMail({ to, subject, text, html });
      if (response.accepted) {
        res.status(200).json({ message: user.email });
      } else {
        res.status(400).json({ message: "Error :Mail Not Send" });
      }
    } else {
      res.status(400).json({ message: "user not Registered" });
    }
  } catch (error) {
    res.status(400).json({ message: "UnAuthorized" });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, token, password } = req.body;
  try {
    const user = await User.findOne({
      email: email,
      resetPasswordToken: token,
    }).exec();
    if (user) {
      const salt = crypto.randomBytes(16);
      crypto.pbkdf2(
        password,
        salt,
        310000,
        32,
        "sha256",
        async function (err, hashedPassword) {
          user.password = hashedPassword;
          user.salt = salt;
          await user.save();
          const to = user.email;
          const subject = "eKart Reset Password Succesfully";
          const text = "Reset Password Succesfully for eKart";
          const html = `<p>Password succesfully reset for ${user.email} </p>`;
          const response = await sendMail({ to, subject, text, html });
          if (response.accepted) {
            res.status(200).json({ message: user.email });
          } else {
            res.status(400).json({ message: "Error :Mail Not Send" });
          }
        }
      );
    } else {
      res.status(400).json({ message: "user not Registered" });
    }
  } catch (error) {
    res.status(400).json({ message: "user not Registered" });
  }
};
