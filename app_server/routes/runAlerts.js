var express = require('express');
var router = express.Router();
var controller = require('../controller/routes');

console.log('%%%%');

/* GET home page. */

router.get('/runAlerts/', controller.runAlertsGet)
	//.post('/runAlerts/', controller.runAlertsPost)
	;

console.log('$$$$');

module.exports = router;