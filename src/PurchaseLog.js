import React, { Component } from 'react';

import './PurchaseLog.css';



export default class PurchaseLog extends Component {
  render() {

    return (
      <div className="PurchaseLog">
        <h3>Purchases</h3>
        <ul>
        {this.props.model.purchases.map((item) =>
          <li key={item.key}>

            ¤{item.price}&nbsp;{item.label}&nbsp;

            {item.seller}&nbsp;->&nbsp;{item.buyer}
          </li>
        )}
        </ul>
      </div>
    );
  }
}
