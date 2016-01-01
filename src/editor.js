const React = require('react');

const { Component } = React;

class Editor extends Component {
    static propTypes = {
        onChange: React.PropTypes.func
    };

    static defaultProps = {
        fontSize: 16,
        files: [ 'main.js', 'sprite.js', 'menu.js' ],
    };

    componentDidMount() {
        const container = this.refs.container;

        const editor = ace.edit(container);
        editor.setTheme("ace/theme/chrome");
        editor.setFontSize(this.props.fontSize);

        const session = editor.getSession();
        session.setMode("ace/mode/javascript");
        session.setUseWorker(false);

        editor.on('change', e => {
            const code = editor.getValue();

            if (this.props.onChange) {
                this.props.onChange(code);
            }
        });
    }

    componentWillReceiveProps(nextProps) {

    }

    render() {
        const style = {
            height: '100%',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Lucida Grande',
            fontSize: 14
        };

        const editorStyle = {
            flexGrow: 1,
            width: '100%'
        };

        const tabStyle = {
            display: 'inline-block',
            width: 150,
            padding: 8,
            textAlign: 'center',
            color: '#888'
        };

        const activeTab = {
            ...tabStyle,
            backgroundColor: 'white',
            color: '#222',
            borderLeft: 'solid blue 2px'
        };

        const headerStyle = {
            margin: 0,
            padding: 0
        };

        const {files} = this.props;

        const selectionIndex = 0;

        return <div style={style}>
            <ul style={headerStyle}>
                {files.map((file, index) => {
                    if (index === selectionIndex) {
                        return <li key={file} style={activeTab}>{file}</li>;
                    } else {
                        return <li key={file} style={tabStyle}>{file}</li>;
                    }
                })}
            </ul>
            <div style={editorStyle} ref="container"></div>
        </div>;
    }
}

module.exports = Editor;
