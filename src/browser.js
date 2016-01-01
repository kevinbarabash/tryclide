const React = require('react');

const { Component } = React;

class Browser extends Component {
    static defaultProps = {
        files: [ 'main.js', 'sprite.js', 'menu.js', 'really_really_long_filename.js' ]
    };

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

        return <ul style={style}>
            {this.props.files.map(file => <li key={file}>{file}</li>)}
        </ul>
    }
}

module.exports = Browser;
