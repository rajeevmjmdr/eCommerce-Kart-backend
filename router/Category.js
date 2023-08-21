const express = require("express");
const { getCategories, createCategory } = require("../controller/Category");
const router = express.Router();

router
    .get('/',getCategories)
    .post('/',createCategory);

exports.router = router;