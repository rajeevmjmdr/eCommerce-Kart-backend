const express = require("express");
const {
  createOrder,
  getOrdersByUser,
  updateOrder,
  deleteOrder,
} = require("../controller/Order");

const router = express.Router();

router
  .post("/", createOrder)
  .get("/", getOrdersByUser)
  .patch("/:id", updateOrder)
  .delete("/:id", deleteOrder);

exports.router = router;
