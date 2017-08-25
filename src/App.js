import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import ForSale from './ForSale';
import Players from './Players';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="FaunaDB hummingbird logo" />
          <h2>Animal Exchange</h2>
        </div>
        <div className="App-intro">
          <div className="info">
          ?&#x20dd;
          </div>
          <ForSale model={this.props.model}/>
          <Players model={this.props.model}/>
        </div>
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(App);
