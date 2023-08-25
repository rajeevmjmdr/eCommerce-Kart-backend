const express = require("express");
const {
  createOrder,
  getOrdersByUser,
  updateOrder,
  deleteOrder,
  getAllOrders,
} = require("../controller/Order");

const router = express.Router();

router
  .post("/", createOrder)
  .get("/user/", getOrdersByUser)
  .get("/", getAllOrders)
  .patch("/:orderId", updateOrder)
  .delete("/:id", deleteOrder);

exports.router = router;
