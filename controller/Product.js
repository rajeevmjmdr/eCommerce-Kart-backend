const model = require("../model/Product");
const Product = model.Product;

exports.createProduct = async (req, res) => {
  const product = new Product(req.body);
  try {
    const doc = await product.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.getProductsByFilter = async (req, res) => {
  let query = Product.find({});
  let queryCount = Product.find({});
  if (req.query.category) {
    query = query.find({ category: req.query.category });
    queryCount = queryCount.find({ category: req.query.category });
  }
  if (req.query.brand) {
    query = query.find({ brand: req.query.brand });
    queryCount = queryCount.find({ brand: req.query.brand });
  }
  if (req.query._page && req.query._limit) {
    const page = req.query._page;
    const pageSize = req.query._limit;
    query = query.skip(pageSize * (page - 1)).limit(pageSize);
    queryCount = queryCount.skip(pageSize * (page - 1)).limit(pageSize);
  }
  // TODO: sorting by discounted price
  if (req.query._sort && req.query._order) {
    query = query.sort({ [req.query._sort]: req.query._order });
  }

  try {
    const doc = await query.exec();
    const totalCount = await queryCount.count().exec();
    res.set("X-Total-Count", totalCount);
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.getProductById = async (req, res) => {
  const {id} = req.params;
  try {
    const product = await Product.findById(id);
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.updateProduct = async (req, res) => {
  const {id} = req.params;
  try {
    const product = await Product.findByIdAndUpdate(id,req.body,{new:true});
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json(err);
  }
};
