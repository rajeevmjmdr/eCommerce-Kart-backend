const express = require("express");
const { addToCart, getCartByUser, updateCart, deleteFromCart } = require("../controller/Cart");


const router = express.Router();

router
    .post('/',addToCart)
    .get('/',getCartByUser)
    .patch('/',updateCart)
    .delete('/:id',deleteFromCart)
 

exports.router = router;