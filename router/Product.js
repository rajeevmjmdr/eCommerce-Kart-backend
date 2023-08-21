const express = require("express");
const { createProduct, getProductsByFilter, getProductById, updateProduct } = require("../controller/Product");
const router = express.Router();

router
    .post('/',createProduct)
    .get('/',getProductsByFilter)
    .get('/:id',getProductById)
    .patch('/:id',updateProduct)

exports.router = router;