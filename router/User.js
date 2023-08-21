const express = require("express");
const { updateUser, getUserById } = require("../controller/User");
const router = express.Router();

router
    .get('/:id',getUserById)
    .patch('/:id',updateUser)

exports.router = router;