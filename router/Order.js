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
  .get("/user/:userId", getOrdersByUser)
  .get("/", getAllOrders)
  .patch("/:id", updateOrder)
  .delete("/:id", deleteOrder);

exports.router = router;
