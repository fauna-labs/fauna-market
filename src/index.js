import React from 'react';
import ReactDOM from 'react-dom';
import Model from './model';
import App from './App';
import registerServiceWorker from './registerServiceWorker';


var model = new Model();

function render() {
  ReactDOM.render(<App model={model}/>, document.getElementById('root'));
}
window._model = model;
render();

model.setupSession().then(() => {
  model.subscribe(render);
  model.refresh();
})
registerServiceWorker();
