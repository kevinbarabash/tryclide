const React = require('react');

const { Component } = React;

const Browser = require('./browser.js');
const Editor = require('./editor.js');
const Viewer = require('./viewer.js');


class App extends Component {
    render() {
        const style = {
            backgroundColor: '#DDD',
            display: 'flex',
            flexDirection: 'row',
            height: '100%',
            boxSizing: 'border-box',
            padding: 5
        };

        return <div style={style}>
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

module.exports = App;
