import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
import './Players.css';
import ReactModal from 'react-modal';

const playerTarget = {
  drop(props) {
    console.log("drop", props);
    return props;
  }
};

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  };
}

class Players extends Component {
  render() {

    return (
      <div className="Players">
        <h3>Players</h3>
        <ul>
        {this.props.model.players.map((player, i) =>
          <DropTargetPlayer key={player.data.name} model={this.props.model} player={player} items={this.props.model.ownedItems[i]} />
        )}
        </ul>
      </div>
    );
  }
}

export default Players;

class Player extends Component {
  constructor () {
    super();
    this.state = {
      showModal: false,
      itemToSell: {
        data : {
        }
      },
      itemPrice: 0
    };
    this.openSaleSettings = this.openSaleSettings.bind(this);
    this.updatePrice = this.updatePrice.bind(this);
    this.sellForPrice = this.sellForPrice.bind(this);
  }
  sellForPrice() {
    this.props.model.makeForSale(this.state.itemToSell, this.state.sellPrice, true);
    this.setState({showModal: false});
  }
  updatePrice(event) {
    console.log({value: event.target.value});
    this.setState({
      sellPrice : event.target.value
    })
  }
  openSaleSettings(item) {
    console.log("openSaleSettings", item);
    this.setState({
      itemToSell : item,
      sellPrice : item.data.price,
      showModal: true
    })
  }
  render() {
    const { forSale, player, key, items, connectDropTarget, isOver } = this.props;
    const itemToSell = this.state.itemToSell;
    return connectDropTarget(
    <li className="Player" key={key}>
      <ReactModal
         isOpen={this.state.showModal}
         contentLabel="Sell Your Item">
         Sale Settings for: {itemToSell.data.label}
         <br/>
         Owner: {player.data.name}
         <br/>
         Price: <input value={this.state.sellPrice} onChange={this.updatePrice.bind(this)}/>
         <a href="#" onClick={this.sellForPrice}>Make For Sale</a>
      </ReactModal>
      <h4>{player.data.name}</h4>
      {player.data.credits}
      <ul className="ownedItems">
        {items.map((item) =>
          <li key={item.data.label}>
            <div className="label" onClick={this.openSaleSettings.bind(this, item)}>{item.data.label}</div>
          </li>
        )}
      </ul>
    </li>);
  }
}

const DropTargetPlayer = DropTarget("forSale", playerTarget, collect)(Player);
