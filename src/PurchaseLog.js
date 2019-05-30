import React, { Component } from 'react';

export default class PurchaseLog extends Component {
  render() {

    return (
      <div className="PurchaseLog">
        <h3>Purchases</h3>
        <ul>
        {this.props.model.purchases.map((item) =>
          <li key={item.key}>
            <div><span className="money">${item.price}</span>{item.label}</div>
            <div>{item.seller}&nbsp;&rarr;&nbsp;{item.buyer}</div>
          </li>
        )}
        </ul>
      </div>
    );
  }
}
