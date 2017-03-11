var mysql      = require('../../node_modules/node-mysql/node_modules/mysql');
var request    = require('../../node_modules/request');

console.log('****');


var connection = mysql.createConnection({
  host     : 'localhost', //'AJBs-MBP.hsd1.ca.comcast.net',
  user     : 'root',
  password : '',
  database : 'stockly'  
});

connection.connect();

connection.query("call stockly.sp_alerts_calculate();", function(err,rows){
  console.log(err);
  connection.end();
});


  