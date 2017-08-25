import React, { Component } from 'react';
import Draggable from 'react-draggable';

import './Players.css';

class Players extends Component {
  render() {
    return (
      <div className="Players">
        <h3>Players</h3>
        <ul>
        {this.props.model.players.map((player, i) =>
          <li className="Player" key={player.data.name}>
            <h4>{player.data.name}</h4>
            {player.data.credits}
            <ul className="ownedItems">
              {this.props.model.ownedItems[i].map((item) =>
                <li key={item.label}>
                  <Draggable>
                    <div className="label">{item.label}</div>
                  </Draggable>
                </li>
              )}
            </ul>
          </li>
        )}
        </ul>
      </div>
    );
  }
}

export default Players;
