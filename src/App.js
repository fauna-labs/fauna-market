import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import ForSale from './ForSale';
import Players from './Players';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="FaunaDB hummingbird logo" />
          <h2>Emoji Exchange</h2>
        </div>
        <div className="App-intro">
          <ForSale model={this.props.model}/>
          <Players model={this.props.model}/>
        </div>
      </div>
    );
  }
}

export default App;
