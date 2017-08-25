import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import ReactModal from 'react-modal';

import ForSale from './ForSale';
import Players from './Players';

class App extends Component {
  constructor () {
    super();
    this.state = {
      showModal: false
    };
    this.openInfo = this.openInfo.bind(this);
    this.closeInfo = this.closeInfo.bind(this);
  }
  openInfo() {
    this.setState({showModal:true});
  }
  closeInfo() {
    this.setState({showModal:false});
  }
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="FaunaDB hummingbird logo" />
          <h2>Animal Exchange</h2>
        </div>
        <div className="App-intro">
        <ReactModal
           isOpen={this.state.showModal}
           contentLabel="Globally Consistent Transactions"
        >
        <div onClick={this.closeInfo}>
        <h1>Globally Consistent Transactions</h1>
        <p>
          In this demo, selling an item involves updating a handful of database records.
          If any one of these updates were to fail, it could leave the database in an
          inconsistent state. When you are buying and selling, you have to be able to
          trust your database.
        </p>
        <p>
          The transaction includes these operations:
          <ul>
            <li>Check the credit balance of the purchasing player to ensure they have available funds.</li>
            <li>Check that the item is for sale.</li>
            <li>Update the balances of the selling player and the purchasing player.</li>
            <li>Update the item with the new owner.</li>
            <li>Write a purchase record.</li>
          </ul>
          If any one of these operations fails, for instance because the player is
          making multiple trades at the same time and exceeds their balance, the
          entire transaction must fail. This also holds true in cases of hardware or
          network failure. So you know that any data you read or write to FaunaDB
          is consistent, taking the guesswork out of writing correct applications.
        </p>
        <p>Click here to return to the game.</p>
        </div>
        </ReactModal>
          <div className="info" onClick={this.openInfo}>
          ?&#x20dd;
          </div>
          {this.props.model.message}
          <ForSale model={this.props.model}/>
          <Players model={this.props.model}/>
        </div>
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(App);
