var express = require('express');
var router = express.Router();
var controller = require('../controller/routes');

/* GET home page. */

router.get('/alertPivotDataGet/', controller.alertPivotDataGet)
	//.post('/runAlerts/', controller.runAlertsPost)
	;

console.log('%#%#%#%#');

module.exports = router;