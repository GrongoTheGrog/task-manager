const express = require('express');
const router = express.Router();

router.post('/createreq', require('./createReq'));
router.post('/acceptreq', require('./solveReq'));


module.exports = router;