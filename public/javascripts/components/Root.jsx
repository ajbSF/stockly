"use strict";

import React from "react";

import NavBar from "./NavBar.jsx";

export class Root extends React.Component {
    render() {
        return (
            <div className="container">
                <div className="row">
                    <NavBar />
                </div>
          		<br />
                <div className="row">
                    
                    {this.props.children}
                        
                </div>
            </div>
        );
    }
}

/*

for each stock ticker in general info{

	dateBeingConsidered = max(alert date)

	get 'list of dates' from max(alert date) to max (historical info date)
	
	for each dateBeingConsidered in 'list of dates'{
	
		create temp_table_Hist_data for the last 14 days from dateBeingConsidered

	}
}

*/
