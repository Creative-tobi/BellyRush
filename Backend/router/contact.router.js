const sendEmail = require('../controller/contact.controller');
const express = require('express');
const {contactUs} = require('../controller/contact.controller');

const router = express.Router();

router.post("/contactus", contactUs);

module.exports = router;