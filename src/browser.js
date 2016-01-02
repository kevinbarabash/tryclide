const React = require('react');

const { Component } = React;
const { connect } = require('react-redux');

const store = require('./store.js');

class Browser extends Component {
    handleDoubleClick(filename) {
        store.dispatch({
            type: 'OPEN_FILE',
            filename: filename
        });
    }

    render() {
        const style = {
            listStyleType: 'none',
            fontFamily: 'Lucida Grande',
            fontSize: 14,
            width: 150,
            margin: 0,
            padding: 0,
            overflow: 'scroll'
        };

        const files = Object.keys(this.props.files);

        return <ul style={style}>
            {files.map(filename =>
                <li
                    key={filename}
                    onDoubleClick={() => this.handleDoubleClick(filename)}
                >
                    {filename}
                </li>
            )}
        </ul>
    }
}

module.exports = connect(state => state)(Browser);
