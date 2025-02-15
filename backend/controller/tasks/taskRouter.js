const express = require('express');
const router = express.Router();

router.post('/createtask', require('./createTask'));
router.post('/deletetask', require('./deleteTask'));
router.post('/gettasks', require('./getTasks'));
router.post('/edittask', require('./editTask'));
router.post('/toggletask', require('./toggle'));

module.exports = router;