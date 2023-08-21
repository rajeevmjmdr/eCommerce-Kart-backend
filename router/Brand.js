const express = require("express");
const { getBrands, createBrand } = require("../controller/Brand");
const router = express.Router();

router
    .get('/',getBrands)
    .post('/',createBrand);

exports.router = router;