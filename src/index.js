import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import {
  BrowserRouter as Router, Routes, Route, Link
} from "react-router-dom";
import Game from './Game'
import Start from './Start'
import App from './App'
import reportWebVitals from './reportWebVitals';
// let dictionary=["1W","2W","3W","4W","5W","6W","7W","8W","9W","1T","2T","3T","4T","5T","6T","7T","8T","9T","1S","2S","3S","4S","5S","6S","7S","8S","9S","DONG","NAN","XI","BEI","ZHONG","FA","BAI","space"];


ReactDOM.render(
  
  <Router>
        <div>
          <h2>Welcome to React Router Tutorial</h2>
          <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <ul className="navbar-nav mr-auto">
            <li><Link to={'/'} className="nav-link"> Start </Link></li>
            <li><Link to={'/Play'} className="nav-link">Game</Link></li>
            <li><Link to={'/App'} className="nav-link">App</Link></li>
          </ul>
          </nav>
          <hr />
          <Routes>
              
              <Route exact path='/' element={<Start/>} />
              <Route path='/Play' element={
              <div class="background"><Game/></div>} />
              <Route path='/App' element={<App/>} />
          </Routes>
        </div>
      </Router>
      //<link rel="stylesheet" type="text/css" href=""></link>+
    //style={require('./static/card/battle-background.jpg').default}
  ,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
