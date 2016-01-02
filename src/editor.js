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

class Editor extends Component {
    constructor() {
        super();

        this.state = {
            editor: null,
            tabList: [
                'main.js',
                'sprites.js',
                'menu.js'
            ]
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

        const selectedFile = this.state.tabList[0];

        if (selectedFile) {
            editor.setValue(this.props.fileList[selectedFile]);
            editor.clearSelection();
        }

        this.setState({ editor, selectedFile });
    }

    updateTab(file) {
        this.setContents(this.props.fileList[file]);
        this.setState({ selectedFile: file });
    }

    handleCloseTab = filename => {
        const { selectedFile } = this.state;

        const tabList = this.state.tabList.filter(name => name != filename);
        const newSelectedFile = selectedFile === filename ? tabList[0] : selectedFile;

        this.setState({
            tabList,
            selectedFile: newSelectedFile
        });

        if (newSelectedFile !== selectedFile) {
            this.setContents(this.props.fileList[newSelectedFile]);
        }
    };

    setContents(contents) {
        const {editor} = this.state;

        this.stopListening = true;
        editor.setValue(contents);
        editor.clearSelection();
        this.stopListening = false;
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

        const headerStyle = {
            margin: 0,
            padding: 0
        };

        const { tabList, selectedFile } = this.state;

        return <div style={style}>
            <ul style={headerStyle}>
                {tabList.map(file => {
                    return <Tab
                        key={file}
                        active={file === selectedFile}
                        label={file}
                        onClick={() => this.updateTab(file)}
                        onCloseTab={this.handleCloseTab}
                    />;
                })}
            </ul>
            <div style={editorStyle} ref="container"></div>
        </div>;
    }
}

module.exports = Editor;
