import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragSource } from 'react-dnd';
import './ForSale.css';

class ForSaleList extends Component {
  render() {
    return (
      <div className="ForSale">
        <h3>Items for Sale</h3>
        <ul>
        {this.props.model.items.map((item) =>
          <li key={item.label}>
            <DraggableForSale label={item.label}/>
            <br/>¤{item.price}
          </li>
        )}
        </ul>
      </div>
    );
  }
}

export default ForSaleList;


const forSaleSource = {
  beginDrag(props) {
    return {
      label: props.label
    };
  }
};

/**
 * Specifies the props to inject into your component.
 */
function collect(connect, monitor) {
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

class ForSale extends Component {
  render() {
    const { isDragging, connectDragSource, label } = this.props;
    return connectDragSource(
      <div style={{ opacity: isDragging ? 0.5 : 1 }}>
        <div className="label">{label}</div>
      </div>
    );
  }
}

ForSale.propTypes = propTypes;

// Export the wrapped component:
const DraggableForSale =  DragSource("ForSale", forSaleSource, collect)(ForSale);
