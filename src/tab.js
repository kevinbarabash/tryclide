const React = require('react');

const { Component } = React;

class Tab extends Component {
    constructor() {
        super();

        this.state = {
            hover: false
        };
    }

    handleMouseOver = (e) => {
        this.setState({ hover: true });
    };

    handleMouseOut = (e) => {
        this.setState({ hover: false });
    };

    handleButtonClick = (e) => {
        e.stopPropagation();
        if (this.props.onCloseTab) {
            this.props.onCloseTab(this.props.label);
        }
    };

    render() {
        const tabStyle = {
            width: 150,
            display: 'inline-block',
            padding: 8,
            textAlign: 'center',
            cursor: 'pointer',
            position: 'relative',
            backgroundColor: this.props.active ? 'white' : 'transparent'
        };

        const buttonStyle = {
            position: 'absolute',
            right: 8,
        };

        const button = <span
            style={buttonStyle}
            onClick={this.handleButtonClick}
        >
            x
        </span>;

        return <li
            style={tabStyle}
            onClick={this.props.onClick}
            onMouseEnter={this.handleMouseOver}
            onMouseLeave={this.handleMouseOut}
        >
            {this.props.label}
            {this.state.hover && button}
        </li>;
    }
}

module.exports = Tab;
