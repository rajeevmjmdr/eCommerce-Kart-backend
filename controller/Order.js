const model = require("../model/Order");
const Order = model.Order;

exports.createOrder = async (req, res) => {
  const order = new Order(req.body);
  try {
    const doc = await order.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.getOrdersByUser = async (req, res) => {
  const { id } = req.user;
  try {
    const orders = await Order.find({ user: id });
    res.status(200).json(orders);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.updateOrder = async (req, res) => {
  const { orderId } = req.params;
  try {
    const doc = await Order.findByIdAndUpdate(orderId, req.body, { new: true });
    res.status(200).json(doc);
  } catch (err) {
    res.status(400).json(err);
  }
};
exports.deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await Order.findByIdAndDelete(id);
    res.status(200).json(doc);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.getAllOrders = async (req, res) => {
  let query = Order.find({deleted:{$ne:true}});
  let queryCount = Order.find({deleted:{$ne:true}});

  if (req.query._page && req.query._limit) {
    const page = req.query._page;
    const pageSize = req.query._limit;
    query = query.skip(pageSize * (page - 1)).limit(pageSize);
    //queryCount = queryCount.skip(pageSize * (page - 1)).limit(pageSize);
  }
  // TODO: sorting by discounted price
  // if (req.query._sort && req.query._order) {
  //   query = query.sort({ [req.query._sort]: req.query._order });
  // }

  try {
    const doc = await query.exec();
    const totalCount = await queryCount.count().exec();
    res.set("X-Total-Count", totalCount);
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json(err);
  }
};
