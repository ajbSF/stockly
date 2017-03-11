import React from 'react';
import ReactDOM from 'react-dom';

var result;

class App extends React.Component {
	constructor(){
		super();

		this.state = {
			myresult: ['buy_sell':'','close':'', 'date':'','description':'','ticker': '','value':'']
		};
	}

	componentDidMount(){
  		this.getData(this);
	}

	getData(that){
		$.ajax({
		    url : "/api/alertDataGet",
		    type : "GET",
		    //data : JSON.stringify({'ticker': 'NFLX'}),
		    contentType : "application/json",
		    dataType : "json"
		    }).done(function(result) {
		       	console.log('*** HELLO in JSX AJAX done',result[0]);
			     	that.setState({
		      			myresult: result[0]
		      		});	      	
		    }).fail(function(err){
		    	console.log('##### JSX AJAX Error',err);
		    });
	}

	render(){
		console.log('*&*&*',result);

		let indents = [];
		for (let i = 0; i < this.state.myresult.length; i++) {

		  if(this.state.myresult[i].date)		
			  indents.push(<tr key={i}>
			  				<td  key={this.state.myresult[i].date}><span className='indent' key={this.state.myresult[i].date}>{this.state.myresult[i].date.slice(0,10)}</span></td>
			  				<td  key={this.state.myresult[i].ticker} className={'BS_' + this.state.myresult[i].buy_sell}><span key={this.state.myresult[i].ticker}>{this.state.myresult[i].ticker}</span></td>
			  				<td  key={this.state.myresult[i].description}><span className='indent' key={this.state.myresult[i].description}>{this.state.myresult[i].description}</span></td>
			  				<td  key={this.state.myresult[i].value}><span className='indent' key={this.state.myresult[i].value}>{this.state.myresult[i].value}</span></td>
			  				<td  key={this.state.myresult[i].buy_sell} className={'BS_' + this.state.myresult[i].buy_sell}><span key={this.state.myresult[i].buy_sell}>{this.state.myresult[i].buy_sell}</span></td>	
			  				<td  key={this.state.myresult[i].close}><span className='indent' key={this.state.myresult[i].close}>{this.state.myresult[i].close}</span></td>	
			  				</tr>);
		}

		return (
	      <div className="commentBox">
	        	<div className="table-responsive">          
				  <table className="table">
				    <thead>
				      <tr>
				        <th>Date</th>
				        <th>Ticker</th>
				        <th>Indicator</th>
				        <th>Indicator Value</th>
				        <th>Buy/Sell</th>
				        <th>Close</th>
				      </tr>
				    </thead>
				    <tbody>
				      {indents}
				    </tbody>
				  </table>
				</div>
	      </div>
	    );
	}	
}

ReactDOM.render(<App />, document.getElementById('content-react-alerts'));

