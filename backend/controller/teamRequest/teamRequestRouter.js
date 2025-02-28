const express = require('express');
const router = express.Router();

router.post('/createreq', require('./createReq'));
router.post('/solvereq', require('./solveReq'));
router.get('/getreq', require('./getReq'));


module.exports = router;