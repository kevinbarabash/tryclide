const React = require('react');

const { Component } = React;

const store = require('./store.js');

class MenuItem extends Component {
    state = {
        highlight: false
    };

    handleMouseEnter = () => {
        console.log('mouse enter');
        this.setState({ highlight: true });
    };

    handleMouseLeave = () => {
        this.setState({ highlight: false });
    };

    handleClick = (e) => {
        this.props.onClick();
    };

    render() {
        const itemStyle = {
            whiteSpace: 'nowrap',
            padding: '2px 16px 2px 16px',
            backgroundColor: this.state.highlight ? 'lightblue' : 'white'
        };

        return <li
            onClick={this.handleClick}
            onMouseEnter={this.handleMouseEnter}
            onMouseLeave={this.handleMouseLeave}
            style={itemStyle}
        >
            {this.props.label}
        </li>;
    }
}

class ContextMenu extends Component {
    handleRename = () => {
        store.dispatch({
            type: 'EDITING_FILENAME'
        });
    };

    handleDelete = () => {
        store.dispatch({
            type: 'DELETE_FILE'
        });
    };

    render() {
        const style = {
            position: 'absolute',
            left: this.props.left,
            top: this.props.top,
            border: 'solid 1px gray',
            backgroundColor: 'white',
            zIndex: 100,
        };

        const listStyle = {
            listStyleType: 'none',
            paddingLeft: 0,
            margin: '4px 0px 4px 0px',
        };

        return <div style={style}>
            <ul style={listStyle}>
                <MenuItem
                    label="Rename file"
                    onClick={this.handleRename}
                />
                <MenuItem
                    label="Delete file"
                    onClick={this.handleDelete}
                />
            </ul>
        </div>
    }
}

module.exports = ContextMenu;
