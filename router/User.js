const express = require("express");
const { updateUser, getUserById } = require("../controller/User");
const router = express.Router();

router
    .get('/own',getUserById)
    .patch('/',updateUser)

exports.router = router;