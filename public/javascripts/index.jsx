
require("./jquery.min.js");

//require('https://fonts.googleapis.com/css?family=Lato');
require("../bootstrap/css/bootstrap.min.css");
require("../bootstrap/js/bootstrap.min.js");

require("../stylesheets/style.css");

require("./ejs.js");

import React    from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, browserHistory, IndexRoute} from 'react-router';

import Alerts from './components/Alerts.jsx';
import Track  from './components/Track.jsx';
import {Root}   from './components/Root.jsx';

class App extends React.Component {

    render() {
        return (
              <Router history={browserHistory}>
                  <Route path="/" component={Root} >
                      <IndexRoute component={Alerts} />
                      <Route path="/track" component={Track} />
                      <Route path="/alerts" component={Alerts} />
                  </Route>
              </Router>
        );
    }
}

ReactDOM.render(<App />, window.document.getElementById('content-react-App'));


