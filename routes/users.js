const express = require('express');
const router = express.Router();
const MiddelwareUser = require("../middleware/middleware");
const ApiUserController = require("../controllers/api.user");
const multer = require("multer");
const upload = multer({dest: "uploads/"});
/* GET users listing. */
module.exports = router;
