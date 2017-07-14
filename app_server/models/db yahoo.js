
var mysql      = require('../../node_modules/node-mysql/node_modules/mysql');
var request    = require('../../node_modules/request');

//import sql_settings from "./sqlSettings"; 
var sql_settings = require('./sqlSettings');

console.log('****',sql_settings);

var createConnection = function(){
    var connection = mysql.createConnection({
                          host     : sql_settings.host,
                          user     : sql_settings.user,
                          password : sql_settings.password,
                          database : sql_settings.database
    });

    connection.connect();
    console.log('*** creating connection: ',connection.threadId);
    return connection;
};

var closeConnection = function(connection){
    console.log("### closing connections: ",connection.threadId);
    connection.end();
};

var runQueryNoReturn = function(connection,queryString,callback,tickerArr){ 
    connection.query(queryString, function(err,rows){
        callback(err,rows,connection,tickerArr)});  
};

var runQueryReturnData = function(connection,queryString,callback,res){
    console.log('runQueryReturnData query: ',queryString);

    connection.query(queryString, function(err,rows){
        callback(err,rows,connection,res)});    
};

var callbackTrackTicker = function(err,rows,connection,tickerArr){

    closeConnection(connection);

    //console.log(connection.escape(queryString));
    if (err) 
        console.log('***** Error, could not find record');
  
    if(rows && rows[0] && rows[0].company_name)
        console.log('callbackTrackTicker: ', rows[0].company_name);
    else{
        console.log('callbackTrackTicker - ticker not found, downloading info for',tickerArr[0]);

        var request = require('request');
        // Get Stock Name
        request('http://finance.yahoo.com/d/quotes.csv?s=' + tickerArr[0] + '&f=sn', function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var arr = body.replace('","', '"|"').replace(/"/g,'').split("|");
            //console.log('***',body,arr.length,arr[1]);

            for(i=0;i<arr.length;i++){
                console.log(arr[i]);
            }
            saveTicker(arr[0].toUpperCase(),arr[1]);
          }
        });
    }
};

module.exports.trackTicker = function(ticker){

    var tickerArr = [];
    tickerArr[0] = ticker;
    var connection = createConnection();


    var queryString = "select * from general_info where ticker = " + connection.escape(tickerArr[0]);

    console.log("trackTicker",queryString);

    //runQuery('select * from general_info');
    runQueryNoReturn(connection,queryString,callbackTrackTicker,tickerArr);

};

var saveTicker = function(ticker,company_name){
    var connection = createConnection();

    var queryString = "insert ignore into general_info (ticker,company_name,track) values (" + connection.escape(ticker) 
        + "," + connection.escape(company_name) + "," + "'Y')";

    console.log("saveTicker",queryString);

    runQueryNoReturn(connection,queryString,callbackSaveTicker);
};

var callbackSaveTicker = function(err,rows,connection){
    if (err) 
        console.log('##### Error, could not save record - ' + err);
    else
        console.log('Ticker saved');  
    closeConnection(connection);
};

var callbackCalculateAlerts_GetTickers = function(err,rows,connection){
    console.log('&&& In callbackCalculateAlerts_GetTickers');

    if (err) 
        console.log('##### Error, could not find record');
      
    if(rows && rows[0] && rows[0].ticker){
        console.log('callbackCalculateAlerts_GetTickers: ', rows[0].ticker, rows[0].date);

        // Delete historical data
        var connectionDHD = createConnection();

        var queryString = "delete from stockly.historical_data where close = '9999999999999999'"; /////////////////////

        console.log("queryString - delete historical: ",queryString);

        runQueryNoReturn(connectionDHD,queryString,callbackCalculateAlerts_DeleteHistoricalData,rows);
    }
    else
        console.log('callbackCalculateAlerts_GetTickers - ticker not found');

    closeConnection(connection);
};

// Returns date formatted as MM-DD-YYYY
var formattedDate = function(addDays){
    var formatDate = new Date(), month;

    month = formatDate.getMonth();
    month == 11 ? month = 12:month += 1;

    /*formatDate.setMonth(formatDate.getMonth());
    formatDate.setYear(formatDate.getFullYear());
    formatDate.setDate(formatDate.getDate()+addDays);  */
    return formatDate.getFullYear() + '-' + ("0" + month).slice(-2) + '-' + ("0" + formatDate.getDate()).slice(-2);

};

var callbackCalculateAlerts_DeleteHistoricalData = function(err,rows,connection,tickerArr){

    closeConnection(connection);

    //'http://ichart.finance.yahoo.com/table.csv?s=AAPL&a=01&b=19&c=2016&d=02&e=19&f=2016&g=d&ignore=.csv'
    if (err)
        console.log('callbackCalculateAlerts_DeleteHistoricalData - ##### Error deleting historical data');
    else{
        console.log('$$$callbackCalculateAlerts_DeleteHistoricalData - ',tickerArr[0].ticker);
        
        // Get historical data
        var link;
        var request = require('request');
        var counter=0;
        var histData=[];
        var endDate = new Date();
        var startDate; // = new Date();
        var completeStartDate, completeEndDate;
        var month;

        endDate.setMonth(endDate.getMonth());
        endDate.setYear(endDate.getFullYear());
        endDate.setDate(endDate.getDate()+10);

        month = endDate.getMonth();
        month == 11 ? month = 12:month += 1;

        //completeStartDate   = startDate.getFullYear() + '-' + startDate.getMonth() + '-' + startDate.getDate();
        completeEndDate     = endDate.getFullYear() + '-' + ("0" + month).slice(-2) + '-' + ("0" + endDate.getDate()).slice(-2);
        console.log('completeEndDate',completeEndDate);

        for(var i=0;i<tickerArr.length;i++){
            
            if(tickerArr[i].date){
                startDate = new Date(tickerArr[i].date);
                startDate.setMonth(tickerArr[i].date.getMonth());
                startDate.setYear(tickerArr[i].date.getFullYear());
                startDate.setDate(tickerArr[i].date.getDate()+1);
            }
            else{
                startDate = new Date();
                startDate.setMonth(startDate.getMonth()-6);
                startDate.setYear(startDate.getFullYear());
                startDate.setDate(startDate.getDate());
            }

            //console.log('*** getting day, year month',tickerArr[i].date, tickerArr[i].date.getMonth(),
            //    tickerArr[i].date.getFullYear(),tickerArr[i].date.getDate());

            //completeStartDate   = startDate.getFullYear() + '-' + startDate.getMonth() + '-' + startDate.getDate();
             // Get next day's stock data

            month = startDate.getMonth();
            month == 11 ? month = 12:month += 1;

            completeStartDate   = startDate.getFullYear() + '-' + ("0" + month).slice(-2) + '-' + ("0" + startDate.getDate()).slice(-2);

            console.log('completeStartDate',completeStartDate);

            link = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20%3D%20%22"
                    + tickerArr[i].ticker + "%22%20and%20startDate%20%3D%20%22" + completeStartDate + "%22%20and%20endDate%20%3D%20%22" + 
                    completeEndDate + "%22&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback="
        
            console.log("link",link);
            request(link, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var info = JSON.parse(body);
                    console.log('^^^^ info,info.query.count,counter,tickerArr.length',info,info.query.count,counter,tickerArr.length);
                    
                    //console.log(counter,info.query.results.quote[0].Symbol + " " + info.query.results.quote[0].Close);
                    histData[counter] = info.query;  //results.quote
                    counter++;

                    // If all ticker data has been downaloaded (this is reqd since the call is async)
                    if(counter + 5 === tickerArr.length){
                        //console.log('^',histData,histData[0].results);
                        console.log('% histData.length,histData[0].count,histData[0]',histData.length,histData[0].count,histData[0]);

                        var connectionHistData = createConnection();
                        var queryString = 'insert into stockly.historical_data (ticker,date,open,high,low,close,volume) values ';
                        for(var i=0;i<histData.length;i++){  // each ticker
                            for(var j=0;j<histData[i].count;j++){  // each new date

                                //console.log('^^ histData.length,histData[i].count,i,j ',histData.length,histData[i].count,i,j);

                                if(histData[i].count === 1){
                                    //console.log('$$$$$$$$$$$$$$ histData[i].Symbol',histData[i].results.quote.Symbol);

                                    queryString += "(" + 
                                    connectionHistData.escape(histData[i].results.quote.Symbol) + ',' + connectionHistData.escape(histData[i].results.quote.Date) + ',' +  
                                    connectionHistData.escape(histData[i].results.quote.Open) + "," + connectionHistData.escape(histData[i].results.quote.High) + "," + 
                                    connectionHistData.escape(histData[i].results.quote.Low) + "," + connectionHistData.escape(histData[i].results.quote.Close) + "," + 
                                    connectionHistData.escape(histData[i].results.quote.Volume) + "),";
                                }
                                else {
                                    //console.log('**************** histData[i][j].Symbol',histData[i].results.quote[j].Symbol);

                                    queryString += "(" + 
                                    connectionHistData.escape(histData[i].results.quote[j].Symbol) + ',' + connectionHistData.escape(histData[i].results.quote[j].Date) + ',' +  
                                    connectionHistData.escape(histData[i].results.quote[j].Open) + "," + connectionHistData.escape(histData[i].results.quote[j].High) + "," + 
                                    connectionHistData.escape(histData[i].results.quote[j].Low) + "," + connectionHistData.escape(histData[i].results.quote[j].Close) + "," + 
                                    connectionHistData.escape(histData[i].results.quote[j].Volume) + "),";
                                }
                            }
                        }
                        queryString = queryString.slice(0, -1);    
                        //queryString = "insert into stockly.historical_data (stock_id,date,open,high,low,close,volume) values (9,'2016-10-27','126.84','126.90','124.42','124.87','6502400'),(9,'2016-10-28','126.02','128.93','126.02','126.57','7050500');";
                        //insert into stockly.historical_data (stock_id,date,open,high,low,close,volume) values (9,'2016-10-28','126.02','128.93','126.02','126.57','7050500');
                        console.log("Save historical data:",queryString);

                        runQueryNoReturn(connectionHistData,queryString,callbackSaveHistoricalData);
                    }
                }
            });
        }
    }
};

var callbackSaveHistoricalData = function(err,rows,connection){
    
    closeConnection(connection);

    if (err) 
        console.log('##### Error, could not save historical_data - ' + err);
    else{
        console.log('callbackSaveHistoricalData - Historical data saved');  

        // Delete historical data
        var connectionSP = createConnection();

        var queryString = "call stockly.sp_alerts_calculate();";

        console.log("queryString - run alert stored proc: ",queryString);

        runQueryNoReturn(connectionSP,queryString,callbackCalculateAlerts_RunAlertsSP);
    }
};

var callbackCalculateAlerts_RunAlertsSP = function(err,rows,connection){
    
    closeConnection(connection);

    if (err) 
        console.log('##### Error, could not run alerts SP - ' + err);
    else{
        console.log('callbackCalculateAlerts_RunAlertsSP - Run Alerts SP success');  
    }
};

module.exports.calculateAlerts = function(){
    var connection = createConnection();
    var queryString = "select general_info.ticker, max(historical_data.date) as date from general_info\
                            left outer join historical_data\
                                on historical_data.ticker = general_info.ticker\
                        where track = 'Y'\
                        group by general_info.ticker";
    var trackTickers = runQueryReturnData(connection,queryString,callbackCalculateAlerts_GetTickers);
};

module.exports.alertDataGet = function(res){
    var connection = createConnection();
    var queryString = "call stockly.sp_get_alerts('2016-10-01');";
    console.log('***',queryString);
    var trackTickers = runQueryReturnData(connection,queryString,callbackAlertDataGet_GetData,res);
    //console.log('***',trackTickers);
};

var callbackAlertDataGet_GetData = function(err,rows,connection,res){
    closeConnection(connection);

    if (err){
        console.log('callbackAlertDataGet_GetData Error, could not get alert data - ' + err);
        res.end('GetData Error');
    }
    else{
        console.log('callbackAlertDataGet_GetData - success');  
        if(rows){
            //console.log(rows);
            //res.update('index', { title: 'Borcar' });
            //res.render('index', { title: 'Borcar' });
            //new EJS({url:'/views/index.ejs'}).update('title','Borcar');
            
            res.json(rows);
            //res.render('partials/todays_alerts', { ticker: "ADSK"});
        }
    }
};

module.exports.alertPivotDataGet = function(res){
    var connection = createConnection();
    var queryString = "call stockly.sp_get_alerts_pivot('2017-01-01');" //" + formattedDate() + "');"; //2017-01-20');"; /(select max(date) from alerts);
    console.log('&&&',queryString);
    var trackTickers = runQueryReturnData(connection,queryString,callbackAlertPivotDataGet_GetData,res);
    //console.log('***',trackTickers);
};

var callbackAlertPivotDataGet_GetData = function(err,rows,connection,res){
    closeConnection(connection);

    if (err){
        console.log('callbackAlertPivotDataGet_GetData Error, could not get alert data - ' + err);
        res.end('GetData Error');
    }
    else{
        console.log('callbackAlertPivotDataGet_GetData - success');  
        if(rows){
            //console.log(rows);
            //res.update('index', { title: 'Borcar' });
            //res.render('index', { title: 'Borcar' });
            //new EJS({url:'/views/index.ejs'}).update('title','Borcar');
            
            res.json(rows);
            //res.render('partials/todays_alerts', { ticker: "ADSK"});
        }
    }
};

