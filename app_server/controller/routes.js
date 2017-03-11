var db = require('../models/db')

console.log('^^^^');

module.exports.index = function(req, res, next) {
  res.render('index', { title: 'stock.ly' , ticker: ""});
  //next();
};

module.exports.users = function(req, res, next) {
  res.send('respond with a resource');
  //next();
};

module.exports.trackGet = function (req, res, next) {  
  var key = req.params.ticker;
  console.log('Ticker: ' + key);
  res.end('Ticker: ' + key);
  //next();
};

module.exports.trackPost = function (req, res, next) {  
  var key = req.params.ticker;
  console.log('Ticker Post: ' + key);
  db.trackTicker(key);
  //console.log(res);
  res.end('Ticker Post End: ' + key);
  //next();
};

module.exports.runAlertsGet = function (req, res, next) {  
  console.log('runAlertsGet: ');
  db.calculateAlerts();
  res.end('Alerts Run');
  //next();
};

module.exports.alertDataGet = function (req, res, next) {  
  console.log('alertDataGet: ');
  db.alertDataGet(res);
  //res.json();
  //next();
};

module.exports.alertPivotDataGet = function (req, res, next) {  
  console.log('alertPivotDataGet: ');
  db.alertPivotDataGet(res);
  //res.json();
  //next();
};

module.exports.calculateAlerts = function (req, res, next){
	db.calculateAlerts();
	db.alertDataGet();
}