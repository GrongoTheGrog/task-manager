const express = require('express');
const router = express.Router();

router.post('/createteam', require('./createTeam'));
router.post('/deleteteam', require('./deleteTeam'));
router.post('/jointeam', require('./joinTeam'));
router.post('/leaveteam', require('./leaveTeam'));
router.get('/getteam', require('./getTeam'));
router.post('/getOneTeam', require('./getOneTeam'));

module.exports = router;