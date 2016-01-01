const React = require('react');
const ReactDOM = require('react-dom');

const App = require('./app.js');

const container = document.createElement('div');
container.style.height = '100%';
document.body.appendChild(container);

ReactDOM.render(<App/>, container);
