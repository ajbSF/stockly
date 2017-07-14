"use strict";

import React from 'react';
import ReactDOM from 'react-dom';
//import NavBar from './NavBar.js';

var result;

export default class Alerts extends React.Component {
	constructor(){
		super();

		this.state = {
			myresult: ['date':'', 'ticker':'','slow_stoch':'','fast_stoch': '', 'in_portfolio': '', 'close':'', 'high':'', 'low':'', 'buy_sell':''],
		};

		this.originalData = ['date':'', 'ticker':'','slow_stoch':'','fast_stoch': '', 'in_portfolio': '', 'close':'', 'high':'', 'low':'', 'buy_sell':''];
		this.latestDate = '1900-01-01';

		this.realizedGainLoss=0;
		this.unrealizedGainLoss=0;

		//this.handleFilter = this.handleFilter.bind(this);
	}

	componentDidMount(){
  		this.getData(this);
	}

	calculateOversoldOverbought(stoch){
		if(stoch >= 80)
			return 'S';
		else if(stoch <= 20)
			return 'B';
		else return '';
	}

	calculateStochMomentum(slow_Stoch, fast_Stoch){

		const slowStoch = Number(slow_Stoch),fastStoch = Number(fast_Stoch);

		// If fast stoch is getting out of oversold/overbought and slow stoch is still in oversold/overbought or
		// if both are in oversold/overbought but fast stoch is looking to move out, then hightlight these as potential trades.
		if ((slowStoch <= 20 && fastStoch >= 20) || (slowStoch >= 80 && fastStoch <= 80) 
			|| (slowStoch <= 20 && fastStoch <= 20 && slowStoch <= fastStoch) || (slowStoch >= 80 && fastStoch >= 80 && slowStoch >= fastStoch))
			return 'BS_Stoch';
		else
			return '';
	}

	/*calculateBuyOrSellPrice(low,high,slow_Stoch,fast_Stoch){
		// Let's set a buy price 1% above the highs of the day to prevent buying too early. Similarly set a sell price of 1% of
		// lows of the day if selling short or selling a trade.
		let buy_or_sell='', price='';
		const slowStoch = Number(slow_Stoch),fastStoch = Number(fast_Stoch);
		
		if((slowStoch <= 20 && fastStoch >= 20) || (slowStoch <= 20 && fastStoch <= 20 && slowStoch <= fastStoch))
			buy_or_sell = 'B';
		else if ((slowStoch >= 80 && fastStoch <= 80) || (slowStoch >= 80 && fastStoch >= 80 && slowStoch >= fastStoch))
			buy_or_sell = 'S';

		if(buy_or_sell === 'B')
			price = high + high*0.01;
		else if (buy_or_sell === 'S')
			price = low - low*0.01;
//console.log('^^^price buy_or_sell',price,buy_or_sell, high, low);	
		if (price > 0)
			return (price.toFixed(2));
		else
			return '';
	}*/

	calculateStopLossPrice(low,high,slowStoch,fastStoch){
		// Let's set a stop loss price of 5%
		//return (buyOrSell === 'B' ? price + price*0.05 : price - price*0.05);
	}

	getData(that){
		$.ajax({
		    url : "/api/alertPivotDataGet",
		    type : "GET",
		    //data : JSON.stringify({'ticker': 'NFLX'}),
		    contentType : "application/json",
		    dataType : "json"
		    }).done(function(result) {
		       	console.log('%%% HELLO in reactGetAlertsPivot.JSX AJAX done',result[0]);
			     	that.setState({
		      			myresult: result[0],
		      		});
		      		that.originalData = result[0];
		      		that.handleAllFilters();	      	
		    }).fail(function(err){
		    	console.log('##### JSX AJAX Error',err);
		    });
	}

	formatDate(date){

		let today = date, month;

		month = today.getMonth();
        month == 11 ? month = 12:month += 1;

        return today.getFullYear() + '-' + ("0" + month).slice(-2) + '-' + ("0" + today.getDate()).slice(-2);
	}

	createChartHyperlink(ticker){
		var link = "http://finance.yahoo.com/chart/" + ticker + "#eyJzaG93QXJlYSI6ZmFsc2UsInNob3dMaW5lIjpmYWxzZSwibXVsdGlDb2xvckxpbmUiOmZhbHNlLCJsaW5lQ29sb3" + 
			"IiOiIjMWFjNTY3IiwibGluZVdpZHRoIjoiNCIsInNob3dDYW5kbGUiOnRydWUsImJvbGxpbmdlclVwcGVyQ29sb3IiOiIjZTIwMDgxIiwiYm9sbGluZ2VyTG93ZXJDb2xvciI6" + 
			"IiM5NTUyZmYiLCJtZmlMaW5lQ29sb3IiOiIjNDVlM2ZmIiwibWFjZERpdmVyZ2VuY2VDb2xvciI6IiNmZjdiMTIiLCJtYWNkTWFjZENvbG9yIjoiIzc4N2Q4MiIsIm1hY2RTaW" +
			"duYWxDb2xvciI6IiMwMDAwMDAiLCJyc2lMaW5lQ29sb3IiOiIjZmZiNzAwIiwic2hvd1N0b2NoIjp0cnVlLCJzdG9jaEtMaW5lQ29sb3IiOiIjZmZiNzAwIiwic3RvY2hETGluZU" +
			"NvbG9yIjoiIzQ1ZTNmZiIsImxpbmVUeXBlIjoiY2FuZGxlIiwicmFuZ2UiOiI2bW8iLCJhbGxvd0NoYXJ0U3RhY2tpbmciOnRydWV9";

		return link;
	}

	handleAllFilters(){

		//console.log("**** handleAllFilters",document.getElementById('filterText').value);

		let filteredArray = [], inPortfolio='N', todaysAlerts='Y', alertsOnly='Y';

		document.getElementById('todaysAlertsCB').checked === true ? todaysAlerts = true: todaysAlerts = false;
		document.getElementById('inPortfolioCB').checked  === true ? inPortfolio  = true: inPortfolio  = false;
		document.getElementById('alertsOnlyCB').checked	  === true ? alertsOnly   = true: alertsOnly   = false;
	
		//console.log('todaysAlerts',todaysAlerts);
		//console.log('inPortfolio',inPortfolio);
		//console.log('alertsOnly',alertsOnly);
		
		filteredArray = this.handleFilter(filteredArray);
	//console.log('filteredArray after filter',filteredArray);

		filteredArray = this.handleTodaysAlertsCB(filteredArray,todaysAlerts);
	//console.log('filteredArray after todays alerts',filteredArray);

		filteredArray = this.handleInPortfolioCB(filteredArray,inPortfolio);
	//console.log('filteredArray after in portfolio',filteredArray);

		filteredArray = this.handleAlertsOnlyCB(filteredArray,alertsOnly);
	//console.log('filteredArray after in portfolio',filteredArray);

		this.setState({myresult: filteredArray});
	}

	handleFilter(filteredArray){

		//console.log("handleFilter filter text:",document.getElementById('filterText').value);

		//let filteredArray = [];

		if(document.getElementById('filterText').value === ''){
			//this.setState({myresult: this.state.originalData});
			//console.log('no text filter');
			return (this.originalData);
		}

		for(let i=0; i<this.originalData.length; i++){
			if((this.originalData[i].ticker.toLowerCase()).substring(0,document.getElementById('filterText').value.length)
				 === document.getElementById('filterText').value.toLowerCase())
				filteredArray.push(this.originalData[i]);
		}

		return filteredArray;
	}

	handleTodaysAlertsCB(filteredArray,todaysAlerts){
console.log(this.latestDate);
		let filteredArrayTodaysAlerts = [];

		if (todaysAlerts){
			for(let i=0; i<filteredArray.length; i++){
				if(filteredArray[i].date.slice(0,10) === this.latestDate)
					filteredArrayTodaysAlerts.push(filteredArray[i]);
			}
		}
		
		else{
			filteredArrayTodaysAlerts = filteredArray;
			//console.log('cb UN-CHECKED');
		}

		return filteredArrayTodaysAlerts;
	}

	handleInPortfolioCB(filteredArray, inPortfolio){

		let filteredArrayInPortfolio = [];

		if (inPortfolio){
			console.log('inPortfolioCB CHECKED');
			for(let i=0; i<filteredArray.length; i++){
				if(filteredArray[i].in_portfolio === 'Y')
					filteredArrayInPortfolio.push(filteredArray[i]);
			}
		}
		else{
			console.log('inPortfolioCB UN-CHECKED');
			filteredArrayInPortfolio = filteredArray;
		}

		return filteredArrayInPortfolio;
	}

	// Filter results to only include stocks that have alerts
	handleAlertsOnlyCB(filteredArray, alertsOnly){

		let filteredArrayAlertsOnly = [];

		if (alertsOnly){
			console.log('alertsOnly CHECKED');
			for(let i=0; i<filteredArray.length; i++){
				/*if(this.calculateOversoldOverbought(filteredArray[i].fast_stoch) === 'B' || this.calculateOversoldOverbought(filteredArray[i].fast_stoch) === 'S' 
					|| this.calculateOversoldOverbought(filteredArray[i].slow_stoch) === 'B' || this.calculateOversoldOverbought(filteredArray[i].slow_stoch) === 'S' )*/
				//if(this.calculateStochMomentum(filteredArray[i].slow_stoch,filteredArray[i].fast_stoch) === 'BS_Stoch')	
				if(filteredArray[i].buy_sell === 'B' || filteredArray[i].buy_sell === 'S')
					filteredArrayAlertsOnly.push(filteredArray[i]);
			}
		}
		else{
			console.log('alertsOnly UN-CHECKED');
			// If filter is unchecked, do not change the result array
			filteredArrayAlertsOnly = filteredArray;
		}

		return filteredArrayAlertsOnly;
	}

	onClickRunAlerts(){
		$.ajax({
           url : "/api/runAlerts",
           type : "GET",
           contentType : "application/json",
           dataType : "json"
           }).done(function(result) {
           		console.log("$$$AJAX Done - Run alerts");
           });
	}

	calculateGainLoss(){
		console.log('calculating gain loss');

		let currently_long_short="none", sold=false, buy_limit_price=10000, sell_limit_price=0, 
			current_holding=0, gain_loss=0, bought_at_price=0, sold_at_price=0;

		for (let i = 0; i < this.state.myresult.length; i++) {

			if(this.state.myresult[i].ticker === 'ATVI'){
				if(this.state.myresult[i].buy_sell === 'B' || this.state.myresult[i].buy_sell === 'S')
					//console.log(this.state.myresult[i].date,this.state.myresult[i].price);

				// If buy signal and you are short the stock,then
				if(this.state.myresult[i].buy_sell === 'B' && currently_long_short === "short"){
					//bought = true;

					// If buy limit price has been set
					/*if(buy_limit_price > 0 && buy_limit_price >=){

					}*/

					// Reduce the stop limit price if the stock has a better buy price
					if (buy_limit_price > this.state.myresult[i].price)
							buy_limit_price = this.state.myresult[i].price;
					
					console.log('setting buy_limit_price', buy_limit_price);
					//current_holding = buy_price * 75;
					//console.log('bought @',buy_price);
					//continue;
				}
				// Else if buy signal, but you're already long the stock, then...
				else if(this.state.myresult[i].buy_sell === 'B' && currently_long_short === "long"){
					// don't add any more for now
				}
				// Else if Sell signal, and you're currently long the stock, then...
				else if (this.state.myresult[i].buy_sell === 'S' && currently_long_short === "long"){
					/*currently_long = false;
					sold = true;*/
					
					// Reduce the stop limit price if the stock has a better buy price
					if (sell_limit_price < this.state.myresult[i].price)
							sell_limit_price = this.state.myresult[i].price;

					console.log('setting sell_limit_price', sell_limit_price);
					/*current_holding = (this.state.myresult[i].price - buy_price) * 75;
					gain_loss = (this.state.myresult[i].price - buy_price) * 75;*/
					//continue;

				}
				// Else if Sell signal, and you are already short the stock, then...
				else if (this.state.myresult[i].buy_sell === 'S' && currently_long_short === "short"){
						// dont add more for now
				}
				// Else if Buy signal and you have no position, then...
				else if (this.state.myresult[i].buy_sell === 'B' && currently_long_short === "none"){

					// Reduce the stop limit price if the stock has a better buy price
					if (buy_limit_price > this.state.myresult[i].price)
							buy_limit_price = this.state.myresult[i].price;

					console.log('--setting buy_limit_price', buy_limit_price,this.state.myresult[i].price);
				}
				// Else if Sell signal and you have no position, then...
				else if (this.state.myresult[i].buy_sell === 'S' && currently_long_short === "none"){

					// Reduce the stop limit price if the stock has a better buy price
					if (sell_limit_price < this.state.myresult[i].price)
							sell_limit_price = this.state.myresult[i].price;

					console.log('--setting sell_limit_price', sell_limit_price,this.state.myresult[i].price);
				}

				// If buy limit price has been set, and the stock triggered it, then:
				if(buy_limit_price > 0 && this.state.myresult[i].low < buy_limit_price 
						&& this.state.myresult[i].high > buy_limit_price){
					bought_at_price = buy_limit_price;
					current_holding = current_holding + (-1 * bought_at_price * 75);
					console.log('*** BOUGHT @',buy_limit_price, current_holding, this.state.myresult[i].date);

					if(currently_long_short === "none")
						currently_long_short = "long";
					else if (currently_long_short === "short")
						currently_long_short = "none";
						
					if(currently_long_short === "none")
						this.realizedGainLoss = this.realizedGainLoss + current_holding;

					console.log('####### realizedGainLoss unrealizedGainLoss',this.realizedGainLoss,this.unrealizedGainLoss);

					buy_limit_price = 10000; // default it to a high price

					console.log('currently_long_short',currently_long_short);
				}

				if(sell_limit_price > 0 && this.state.myresult[i].low < sell_limit_price 
						&& this.state.myresult[i].high > sell_limit_price){
					sold_at_price = sell_limit_price;
					current_holding =  current_holding + (sold_at_price * 75);
					console.log('*** SOLD @',sold_at_price, current_holding,this.state.myresult[i].date);

					if(currently_long_short === "none")
						currently_long_short = "short";
					else if (currently_long_short === "long")
						currently_long_short = "none";						

					if(currently_long_short === "none")
						this.realizedGainLoss = this.realizedGainLoss + current_holding;
					
					console.log('%%%%%%%% realizedGainLoss unrealizedGainLoss',this.realizedGainLoss,this.unrealizedGainLoss);

					sell_limit_price = 0;

					console.log('currently_long_short',currently_long_short);
				}
			}

			if((i>0) && (this.state.myresult[i-1].ticker !== this.state.myresult[i].ticker) 
					&& this.state.myresult[i-1] === 'ATVI'){
				if(currently_long_short !== "none")
					this.unrealizedGainLoss = this.unrealizedGainLoss + (current_holding + this.state.myresult[i].close*75)

				//if(currently_long_short === "long")
			}
		}

		console.log('$$$$$$$$ realizedGainLoss unrealizedGainLoss',this.realizedGainLoss,this.unrealizedGainLoss);
	}

	render(){
		console.log('%%%###',result);

//		this.calculateGainLoss();

		let long_term_stocks = [], short_term_stocks = [];
		for (let i = 0; i < this.state.myresult.length; i++) {

		  if(this.state.myresult[i].date && this.state.myresult[i].short_term === 'Y'){

		  	  if(this.latestDate < this.state.myresult[i].date)
		  	  	this.latestDate = this.state.myresult[i].date;
		  	  	//this.latestDate = this.formatDate(new Date(this.state.myresult[i].date));

			  short_term_stocks.push
				(<tr key={i} className={'InPortfolio_' + this.state.myresult[i].in_portfolio}>
					<td  key={i+this.state.myresult[i].date+this.state.myresult[i].ticker}>
						{this.state.myresult[i].date.slice(0,10)}
					</td>
			  		<td  key={i+this.state.myresult[i].ticker+this.state.myresult[i].date}><a href={this.createChartHyperlink(this.state.myresult[i].ticker)}  target="#">
			  			<span className='indent makebold' key={i+i+this.state.myresult[i].ticker}>{this.state.myresult[i].ticker}</span></a>
			  		</td>
			  		<td  key={i+this.state.myresult[i].slow_stoch+this.state.myresult[i].date+this.state.myresult[i].ticker+'V'} 
			  				className={'BS_'+this.calculateOversoldOverbought(this.state.myresult[i].slow_stoch)+' '
	 					+ this.calculateStochMomentum(this.state.myresult[i].slow_stoch,this.state.myresult[i].fast_stoch)}>
			  				{this.state.myresult[i].slow_stoch}
			  		</td>
			  		<td  key={i+this.state.myresult[i].fast_stoch+this.state.myresult[i].date+this.state.myresult[i].ticker+'W'} 
			  				className={'BS_'+this.calculateOversoldOverbought(this.state.myresult[i].fast_stoch)+' '
			  			+ this.calculateStochMomentum(this.state.myresult[i].slow_stoch,this.state.myresult[i].fast_stoch)}>
			  				{this.state.myresult[i].fast_stoch}
			  		</td>
			  		<td  key={i+this.state.myresult[i].close+this.state.myresult[i].date+this.state.myresult[i].ticker+'X'}>
			  			{this.state.myresult[i].close}
			  		</td>				  				
			  		<td  key={i+this.state.myresult[i].low+this.state.myresult[i].date+this.state.myresult[i].ticker+'Y'}
			  			className='indent'>
			  			{this.state.myresult[i].low}
			  		</td>				  				
			  		<td  key={i+this.state.myresult[i].high+this.state.myresult[i].date+this.state.myresult[i].ticker+'Z'} 
			  			className='indent'>
			  			{this.state.myresult[i].high}
			  		</td>	
			  		<td  key={i+this.state.myresult[i].high+this.state.myresult[i].close+this.state.myresult[i].date+this.state.myresult[i].ticker} 
			  			className={this.state.myresult[i].buy_sell + '_Stoch' + ' makebold'}>			  			
			  				{this.state.myresult[i].price}
			  		</td>	
			  		<td  key={i+this.state.myresult[i].low+this.state.myresult[i].close+this.state.myresult[i].ticker+this.state.myresult[i].date} 
			  			className={this.calculateStochMomentum(this.state.myresult[i].slow_stoch,this.state.myresult[i].fast_stoch)}>
			  				{this.calculateStopLossPrice(this.state.myresult[i].low,this.state.myresult[i].high,
			  					this.state.myresult[i].slow_stoch,this.state.myresult[i].fast_stoch)}
			  		</td>				  				
			  	</tr>);
		  }

		  if(this.state.myresult[i].date && this.state.myresult[i].long_term === 'Y'){

		  	  if(this.latestDate < this.state.myresult[i].date)
		  	  	this.latestDate = this.formatDate(new Date(this.state.myresult[i].date));

			  long_term_stocks.push
				(<tr key={i} className={'InPortfolio_' + this.state.myresult[i].in_portfolio}>
					<td  key={i+i+this.state.myresult[i].date+this.state.myresult[i].ticker}>
						{this.state.myresult[i].date.slice(0,10)}
					</td>
			  		<td  key={i+i+this.state.myresult[i].ticker+this.state.myresult[i].date}>
			  			<a href={this.createChartHyperlink(this.state.myresult[i].ticker)}  target="#">
			  				<span className='indent makebold' key={i+i+this.state.myresult[i].ticker}>{this.state.myresult[i].ticker}</span>
			  			</a>
			  		</td>
			  		{/* */}
			  		<td  key={i+i+this.state.myresult[i].slow_stoch+this.state.myresult[i].date+this.state.myresult[i].ticker+'J'} 
			  			className={'BS_'+this.calculateOversoldOverbought(this.state.myresult[i].slow_stoch)+' '
	 					+ this.calculateStochMomentum(this.state.myresult[i].slow_stoch,this.state.myresult[i].fast_stoch)}>
			  				{this.state.myresult[i].slow_stoch}
			  		</td>
			  		<td  key={i+i+this.state.myresult[i].fast_stoch+this.state.myresult[i].date+this.state.myresult[i].ticker+'K'} 
			  			className={'BS_'+this.calculateOversoldOverbought(this.state.myresult[i].fast_stoch)+' '
			  			+ this.calculateStochMomentum(this.state.myresult[i].slow_stoch,this.state.myresult[i].fast_stoch)}>
			  				{this.state.myresult[i].fast_stoch}
			  		</td>
			  		<td  key={i+i+this.state.myresult[i].close+this.state.myresult[i].date+this.state.myresult[i].ticker+'L'}>
			  			{this.state.myresult[i].close}
			  		</td>				  				
			  		<td  key={i+i+this.state.myresult[i].low+this.state.myresult[i].date+this.state.myresult[i].ticker+'M'}
			  			className='indent'>
			  				{this.state.myresult[i].low}
			  		</td>				  				
			  		<td  key={i+i+this.state.myresult[i].high+this.state.myresult[i].date+this.state.myresult[i].ticker+'N'}
			  			className='indent'>
			  			{this.state.myresult[i].high}
			  		</td>	
			  		<td  key={i+i+this.state.myresult[i].close+this.state.myresult[i].high+this.state.myresult[i].date+this.state.myresult[i].ticker} 
			  			className={this.state.myresult[i].buy_sell + '_Stoch' + ' makebold'}>
			  				{this.state.myresult[i].price}
			  		</td>	
			  		<td  key={i+i+this.state.myresult[i].low+this.state.myresult[i].close+this.state.myresult[i].ticker+this.state.myresult[i].date} 
			  			className={this.calculateStochMomentum(this.state.myresult[i].slow_stoch,this.state.myresult[i].fast_stoch)}>
			  				{this.calculateStopLossPrice(this.state.myresult[i].low,this.state.myresult[i].high,
			  					this.state.myresult[i].slow_stoch,this.state.myresult[i].fast_stoch)}
			  		</td>			  				
			  	</tr>);
		  }

		}		
//console.log('@@@@@@@',long_term_stocks[0]);
		return (
	      
	      	<div className='container'>
	      	  	<div className='filters well well-sm'>
		      	  	<div className='row'>
	      	  			<div className='col-sm-6'>
	      	  				<div className='row'>
		      	  				<div className='col-sm-3'>
			      	  				<label htmlFor="filterText">Search:</label>
			      	  			</div>
				      	  		<div className='col-sm-9'>
				      	  			<input id='filterText' className="form-control" type="text" onChange={this.handleAllFilters.bind(this)} />
				      	  		</div>
				      	  	</div>
		      	  		</div>
		      	  	</div>
		      	  	<br/>
		      	  	<div className='row'>
		      	  		<div className='col-sm-12'>
		      	  			<div className='row'>
			      	  			<div className='col-xs-12 col-sm-4'>
			      	  				<div className='col-xs-5 col-sm-9 text-right'>
			      	  					<label htmlFor="todaysAlertsCB">Latest Results:</label>
				      	  			</div>
				      	  			<div className="checkbox-inline col-xs-7 col-sm-3">
									  <input type="checkbox" value="" id="todaysAlertsCB" defaultChecked="true" 
									  		onChange={this.handleAllFilters.bind(this)}/>
									</div>
			      	  			</div>
				      	  		<div className='col-xs-12 col-sm-4'>
				      	  			<div className='col-xs-5 col-sm-9 text-right'>
				      	  				<label htmlFor="inPortfolioCB">In Portfolio Only:</label>
				      	  			</div>
				      	  			<div className="checkbox-inline col-xs-7 col-sm-3">
									  <input type="checkbox" value="" id="inPortfolioCB"  
									  		onChange={this.handleAllFilters.bind(this)}/>
									</div>
				      	  		</div>
				      	  		<div className='col-xs-12 col-sm-4'>
				      	  			<div className='col-xs-5 col-sm-9 text-right'>
				      	  				<label htmlFor="alertsOnlyCB">Alerts Only:</label>
				      	  			</div>
				      	  			<div className="checkbox-inline col-xs-7 col-sm-3">
									  <input type="checkbox" value="" id="alertsOnlyCB" defaultChecked="true"
									  		onChange={this.handleAllFilters.bind(this)}/>
									</div>
				      	  		</div>
				      	  	</div>   
						</div>				
		      	  	</div>
		      	</div>
	      	  	<br />
	      	  	<div className='row'>
			      <div className='shortTermTable well well-sm'>
			        	<div className="table-responsive">   
			        	<h4>SHORT TERM</h4>       
						  <table className="table table-hover table-condensed">
						    <thead>
						      <tr>
						        <th>Date</th>
						        <th>Ticker</th>
						        <th>Slow Stoch</th>
						        <th>Fast Stoch</th>
						        <th>Close</th>
						        <th>Low</th>
						        <th>High</th>
						        <th>Price</th>
						        <th>Stop Loss</th>
						      </tr>
						    </thead>
						    <tbody>
						      {short_term_stocks}
						    </tbody>
						  </table>
						</div>
			      </div>
			      <div className="longTermTable well well-sm">
			        	<div className="table-responsive">     
			        	<h4>LONG TERM</h4>
						  <table className="table table-hover table-condensed">
						    <thead>
						      <tr>
						        <th>Date</th>
						        <th>Ticker</th>
						        <th>Slow Stoch</th>
						        <th>Fast Stoch</th>
						        <th>Close</th>
						        <th>Low</th>
						        <th>High</th> 
						        <th>Price</th>
						        <th>Stop Loss</th>
						      </tr>
						    </thead>
						    <tbody>
						      {long_term_stocks}
						    </tbody>
						  </table>
						</div>
			      </div>
			    </div>
			    <div className="row">
		          <div className="form-group">
		            <div className="col-sm-4">
		              <button id="button_run_alerts" type="button" className="btn btn-primary col-sm-5"
		              	onClick={this.onClickRunAlerts.bind(this)}>Run Alerts</button>
		            </div>
		          </div>
		        </div>
		   	</div>
		  
	    );
	}	
}

//ReactDOM.render(<App />, document.getElementById('content-react-alerts-pivot'));

/*this.state.myresult[i].price
			  				{this.calculateBuyOrSellPrice(this.state.myresult[i].low,this.state.myresult[i].high
			  				,this.state.myresult[i].slow_stoch,this.state.myresult[i].fast_stoch)}*/


