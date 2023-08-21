const express = require("express");
const { createUser,checkUser } = require("../controller/Auth");

const router = express.Router();

router
    .post('/signup',createUser)
    .post('/login',checkUser)

exports.router = router;