const express = require('express');
const router = express.Router();

router.post('/createtask', require('./createTask'));
router.post('/deletetask', require('./deleteTask'));
router.post('/gettasksteam', require('./getTasksTeam'));
router.post('/gettasksauthor', require('./getTasksAuthor'));
router.post('/edittask', require('./editTask'));
router.post('/toggletask', require('./toggle'));

module.exports = router;