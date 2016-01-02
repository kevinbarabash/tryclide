const React = require('react');
const ReactDOM = require('react-dom');
const { Provider } = require('react-redux');

const App = require('./app.js');
const store = require('./store.js');

const container = document.createElement('div');
container.style.height = '100%';
document.body.appendChild(container);

ReactDOM.render(
    <Provider store={store}>
        <App/>
    </Provider>,
    container
);
