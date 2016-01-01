const React = require('react');

const { Component } = React;

class Editor extends Component {
    constructor() {
        super();

        this.state = {
            selectionIndex: 0,
            editor: null,
        };

        this.stopListening = false;
    }

    static propTypes = {
        onChange: React.PropTypes.func
    };

    static defaultProps = {
        fontSize: 16,
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
            if (!this.stopListening) {
                const code = editor.getValue();
                const { selectedFile } = this.state;

                if (this.props.onChange) {
                    this.props.onChange(selectedFile, code);
                }
            }
        });

        const selectedFile = Object.keys(this.props.files)[0];

        if (selectedFile) {
            editor.setValue(this.props.files[selectedFile]);
            editor.clearSelection();
        }

        this.setState({ editor, selectedFile });
    }

    componentWillReceiveProps(nextProps) {

    }

    updateTab(file) {
        const { editor } = this.state;

        this.stopListening = true;
        editor.setValue(this.props.files[file]);
        editor.clearSelection();
        this.stopListening = false;

        this.setState({ selectedFile: file });
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
            color: '#888',
            cursor: 'pointer',
            boxSizing: 'border-box',
            borderLeft: 'solid transparent 2px'
        };

        const activeTab = {
            ...tabStyle,
            backgroundColor: 'white',
            color: '#222',
            borderLeft: 'solid transparent 2px',
        };

        const headerStyle = {
            margin: 0,
            padding: 0
        };

        const { files } = this.props;
        const { selectedFile } = this.state;

        return <div style={style}>
            <ul style={headerStyle}>
                {Object.keys(files).map(file => {
                    if (file === selectedFile) {
                        return <li
                            key={file}
                            style={activeTab}
                            onClick={() => this.updateTab(file)}
                        >
                            {file}
                        </li>;
                    } else {
                        return <li
                            key={file}
                            style={tabStyle}
                            onClick={() => this.updateTab(file)}
                        >
                            {file}
                        </li>;
                    }
                })}
            </ul>
            <div style={editorStyle} ref="container"></div>
        </div>;
    }
}

module.exports = Editor;
