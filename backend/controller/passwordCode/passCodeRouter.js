const express = require('express');
const router = express.Router();

router.post('/sendEmail', require('./sendEmail'));
router.post('/approveCode', require('./approveCode'));


module.exports = router;
