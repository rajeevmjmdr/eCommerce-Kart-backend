const model = require("../model/User");
const User = model.User;

exports.createUser = async (req, res) => {
  const user = new User(req.body);
  try {
    const doc = await user.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.checkUser = async (req, res) => {
  //const user = new User(req.body);
  try {
    const user = await User.findOne(
      { email: req.body.email, password: req.body.password },
      " id email name "
    );
    if (user) {
      res.status(201).json(user);
    } else {
      res.status(400).json({ message: "Invalid Credentials" });
    }
  } catch (err) {
    res.status(400).json(err);
  }
};
