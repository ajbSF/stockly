"use strict";

import React from 'react';
import ReactDOM from 'react-dom';

export default class Track extends React.Component {
	
	onClickTrack(){
		$.ajax({
	           url : "/api/track/" + document.getElementById('ticker_track_input').value,
	           type : "POST",
	           contentType : "application/json",
	           dataType : "json"
	           }).done(function(result) {
	           		console.log("$$$$$ AJAX Done - Track");
	    });
	}

	render(){		
		return (
	
	      	<div className='container'>
	      	  	<div className='row'>
	      	  		<div className='col-md-4 makebold text-left'>
	      	  			<h2>TRACK</h2>
	      	  		</div>
	      	  		
				      <div className="row">
				        <div className="form-group">
				          <div className="col-sm-9">
				            <label htmlFor="ticker_track_input" className="control-label col-sm-2">Add Ticker: </label>
				            <div className="col-sm-4">
				              <input type="string" className="form-control" id="ticker_track_input" 
				              	name="ticker_track_input" defaultValue='aapl'/>
				            </div>
				            <button id="button_track" type="button" className="btn btn-primary col-sm-2"
				            	onClick={this.onClickTrack.bind(this)}>
				            	Track
				            </button>
				          </div>
				        </div>
				      </div>
	      	  	</div>
	      	</div>	      	
	    );
	}	
}
