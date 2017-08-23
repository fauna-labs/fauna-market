import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Model from './model';
import App from './App';
import registerServiceWorker from './registerServiceWorker';


var model = new Model();

function render() {
  ReactDOM.render(<App model={model}/>, document.getElementById('root'));
}
window._model = model;
model.subscribe(render);
render();
model.refresh();
registerServiceWorker();
