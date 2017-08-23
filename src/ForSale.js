import React, { Component } from 'react';
import './ForSale.css';

class ForSale extends Component {
  render() {
    return (
      <div className="ForSale">
        <h3>Items for Sale</h3>
        <ul>
        {this.props.model.items.map((item) =>
          <li key={item.label}><span className="label">{item.label}</span><br/>¤{item.price}</li>
        )}
        </ul>
      </div>
    );
  }
}

export default ForSale;
