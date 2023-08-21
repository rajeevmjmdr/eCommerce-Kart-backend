const model = require("../model/User");
const User = model.User;

exports.updateUser = async (req, res) => {
  const {id} = req.params;
  try {
    const user = await User.findByIdAndUpdate(id,req.body,{new:true});
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json(err);
  }
};
exports.getUserById = async (req, res) => {
  const {id} = req.params;
 
  try {
    const user = await User.findById(id,"name email addresses");
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json(err);
  }
};

