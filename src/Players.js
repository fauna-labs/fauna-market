import React, { Component } from 'react';
import { DragSource } from 'react-dnd';
import { DropTarget } from 'react-dnd';
import PropTypes from 'prop-types';
import './Players.css';
import ReactModal from 'react-modal';

const playerTarget = {
  drop(props) {
    console.log("drop playerTarget", props);
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
        <ul className="playerList">
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
    this.notForSale = this.notForSale.bind(this);
  }
  sellForPrice() {
    this.props.model.makeForSale(this.state.itemToSell, this.state.sellPrice, true);
    this.setState({showModal: false});
  }
  notForSale() {
    this.props.model.makeForSale(this.state.itemToSell, this.state.sellPrice, false);
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
    const { player, key, items, connectDropTarget } = this.props;
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
         For Sale: {(itemToSell.data.for_sale||"").toString()}
         <br/>
         Price: <input value={this.state.sellPrice} onChange={this.updatePrice.bind(this)}/>
         <br/>
         <a href="#sell" onClick={this.sellForPrice}>Make For Sale</a>
         <br/>
         <a href="#notsell" onClick={this.notForSale}>Make Not For Sale</a>
      </ReactModal>
      <h4>{player.data.name}</h4>
      <p>Balance: ${player.data.credits}</p>
      <ul className="ownedItems">
        {items.map((item) =>
          <li key={item.data.label} className={item.data.for_sale ? "forSale" : "isnotForSale"}>
            <DraggableInventory value="sell" label={item.data.label} item={item} model={this.props.model}/>
          </li>
        )}
      </ul>
    </li>);
  }
}

const DropTargetPlayer = DropTarget("forSale", playerTarget, collect)(Player);



const inventorySource = {
  beginDrag(props) {
    return {
      label: props.label,
      item : props.item
    };
  },
  endDrag(props, monitor) {
    const result = monitor.getDropResult();
    console.log('endDrag', props, result)
    if (result) {
      console.log("dragged", props.model, props.item, result)
      var price = prompt("Choose a sale price.")
      props.model.makeForSale(props.item, price, true);
    }
    return {
      label: props.label,
      item : props.item
    }
  }
};

/**
 * Specifies the props to inject into your component.
 */
function collectInventory(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
}

const propTypes = {
  label: PropTypes.string.isRequired,

  // Injected by React DnD:
  isDragging: PropTypes.bool.isRequired,
  connectDragSource: PropTypes.func.isRequired
};

// <div className="label" onClick={this.openSaleSettings.bind(this, item)}>{item.data.label}</div>


class Inventory extends Component {
  render() {
    const { isDragging, connectDragSource, label } = this.props;
    return connectDragSource(
      <div style={{ opacity: isDragging ? 0.5 : 1 }}>
        <div className="label">{label}<span className="sell">Sell</span></div>
      </div>
    );
  }
}

Inventory.propTypes = propTypes;

// Export the wrapped component:
const DraggableInventory =  DragSource("inventory", inventorySource, collectInventory)(Inventory);
