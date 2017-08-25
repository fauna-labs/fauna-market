import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
import './Players.css';

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
          <DropTargetPlayer key={player.data.name} player={player} items={this.props.model.ownedItems[i]} />
        )}
        </ul>
      </div>
    );
  }
}

export default Players;

class Player extends Component {
  render() {
    const { forSale, player, key, items, connectDropTarget, isOver } = this.props;
    return connectDropTarget(
    <li className="Player" key={key}>
      <h4>{player.data.name}</h4>
      {player.data.credits}
      <ul className="ownedItems">
        {items.map((item) =>
          <li key={item.data.label}>
            <div className="label">{item.data.label}</div>
          </li>
        )}
      </ul>
    </li>);
  }
}

const DropTargetPlayer = DropTarget("forSale", playerTarget, collect)(Player);
