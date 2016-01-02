const React = require('react');

const { Component } = React;

class Browser extends Component {
    static defaultProps = {
        files: [ 'main.js', 'sprite.js', 'menu.js', 'really_really_long_filename.js' ]
    };

    handleDoubleClick(file) {
        if (this.props.onOpenFile) {
            this.props.onOpenFile(file);
        }
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

        return <ul style={style}>
            {this.props.files.map(file =>
                <li
                    key={file}
                    onDoubleClick={() => this.handleDoubleClick(file)}
                >
                    {file}
                </li>
            )}
        </ul>
    }
}

module.exports = Browser;
