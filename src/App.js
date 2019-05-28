import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import ReactModal from 'react-modal';

import ForSale from './ForSale';
import Players from './Players';
import PurchaseLog from './PurchaseLog';

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
        <header>
          <div className="brand">
            <img src={logo} className="App-logo" alt="FaunaDB hummingbird logo" />
            <p>Market</p>
          </div>
          <div className="utility">
            <div className="info" onClick={this.openInfo}>
              About
            </div>
          </div>
        </header>
        <main>
          <ReactModal
            isOpen={this.state.showModal}
            contentLabel="Globally Consistent Transactions"
          >
          <div>
            <div className="modal-header">
              <h2>Globally Consistent Transactions</h2>
              <div className="close" onClick={this.closeInfo}>+</div>
            </div>
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
          </div>
          </ReactModal>
        <section className="instructions">
          <h2>How To Play</h2>
          <p>To sell an item from the Marketplace to a player, simply drag it to the player. To put a new item up for sale, simply click it and set the price.</p>
        </section>
        <section className="game">
          <div className="gameboard">
            <p className="notification">
              {this.props.model.client ? "" : "Loading session... 🐝"}
              {this.props.model.message}
            </p>        
            <ForSale model={this.props.model} items={this.props.model.items}/>
            <Players model={this.props.model}/>
          </div>
          <PurchaseLog model={this.props.model}/>
        </section>
        </main>
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(App);
