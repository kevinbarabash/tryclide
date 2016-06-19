const React = require('react');

const { Component } = React;
const { connect } = require('react-redux');

const Browser = require('./browser.js');
const Editor = require('./editor.js');
const Viewer = require('./viewer.js');
const store = require('./store.js');

class App extends Component {
    handleClick = () => {
        if (this.props.contextMenu) {
            store.dispatch({
                type: 'HIDE_CONTEXT_MENU'
            });
        }
    };

    render() {
        const style = {
            backgroundColor: '#DDD',
            display: 'flex',
            flexDirection: 'row',
            height: '100%',
            boxSizing: 'border-box',
            padding: 5
        };

        return <div
            onClick={this.handleClick}
            style={style}
        >
            <Browser
                onOpenFile={this.handleOpenFile}
            />
            <Editor
                fontSize={14}
                onChange={this.handleChange}
            />
            <Viewer/>
        </div>;
    }
}

module.exports = connect(state => state)(App);
