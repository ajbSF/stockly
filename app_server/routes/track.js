var express = require('express');
var router = express.Router();
var controller = require('../controller/routes');

/* GET home page. */

router.get('/track/:ticker', controller.trackGet)
	.post('/track/:ticker', controller.trackPost);

module.exports = router;