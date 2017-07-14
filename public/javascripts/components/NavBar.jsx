import React from 'react';
import ReactDOM from 'react-dom';
import {Link} from "react-router";

export const NavBar = () => {
			
		return (
	      	<div className='container'>
	      	  	<div className='row well well-sm navBar'>
	      	  		<div className='col-xs-12 col-sm-4 makebold text-left'>
	      	  			<h2>stock.ly</h2>
	      	  		</div>
	      	  		<div className='col-xs-12 col-sm-6 makebold text-left'>
	      	  		
	      	  		</div>
	      	  		<div className='col-xs-12 col-sm-1 makebold text-right'>
	      	  			<h4><Link to={"/alerts"} activeStyle={{color: "yellow"}} className="navBar">Home</Link></h4>
	      	  		</div>
	      	  		<div className='col-xs-12 col-sm-1 makebold text-right'>
	      	  			<h4><Link to={"/track"} activeStyle={{color: "yellow"}} className="navBar">Track</Link></h4>
	      	  		</div>
	      	  	</div>
	      	</div>
	    );
	
}

/*export default class NavBar extends React.Component {
	
	render(){		

		return (
	      	<div className='container'>
	      	  	<div className='row well well-sm navBar'>
	      	  		<div className='col-xs-12 col-sm-4 makebold text-left'>
	      	  			<h2>stock.ly</h2>
	      	  		</div>
	      	  		<div className='col-xs-12 col-sm-6 makebold text-left'>
	      	  		
	      	  		</div>
	      	  		<div className='col-xs-12 col-sm-1 makebold text-right'>
	      	  			<h4><Link to={"/alerts"} activeStyle={{color: "yellow"}} className="navBar">Home</Link></h4>
	      	  		</div>
	      	  		<div className='col-xs-12 col-sm-1 makebold text-right'>
	      	  			<h4><Link to={"/track"} activeStyle={{color: "yellow"}} className="navBar">Track</Link></h4>
	      	  		</div>
	      	  	</div>
	      	</div>
	    );
	}	
}*/
