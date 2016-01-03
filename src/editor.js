const React = require('react');

const { Component } = React;
const { connect } = require('react-redux');

const Tab = require('./tab.js');

function debounce(func, wait, immediate) {
    var timeout;
    return function(...args) {
        var context = this;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

class Editor extends Component {
    constructor() {
        super();

        this.state = {
            editor: null
        };

        this.stopListening = false;
    }

    static defaultProps = {
        fontSize: 16,
    };

    componentDidMount() {
        this.lintWorker = new Worker('src/lint_worker.js');
        this.lintWorker.addEventListener('message', e => {
            const {code, messages} = e.data;
            if (messages.length > 0) {
                console.log('lint: %o', messages);
            } else {
                this.updateCode(code);
            }
        });

        const container = this.refs.container;

        const editor = ace.edit(container);
        editor.setTheme("ace/theme/chrome");
        editor.setFontSize(this.props.fontSize);
        editor.$blockScrolling = Infinity

        const session = editor.getSession();
        session.setMode("ace/mode/javascript");
        session.setUseWorker(false);

        editor.on('change', e => {
            if (!this.stopListening) {
                const code = editor.getValue();

                if (this.props.editor.activeFile.endsWith('.js')) {
                    // JavaScript files
                    this.lintCode(code);
                } else {
                    // HTML files
                    this.updateCode(code);
                }
            }
        });

        const activeFile = this.props.editor.activeFile;
        const contents = this.props.files[activeFile];

        if (activeFile) {
            editor.setValue(contents);
            editor.clearSelection();
        }

        this.setState({ editor });
    }

    componentWillReceiveProps(newProps) {
        if (this.props.editor.activeFile !== newProps.editor.activeFile) {
            this.setContents(newProps.files[newProps.editor.activeFile]);
        }
    }

    updateCode = debounce(code => {
        this.props.dispatch({
            type: 'UPDATE_FILE',
            code: code
        })
    }, 250);

    lintCode = debounce(code => {
        this.lintWorker.postMessage({
            code: code
        });
    }, 250);

    selectTab(filename) {
        this.props.dispatch({
            type: 'SELECT_TAB',
            filename: filename
        });
    }

    handleCloseTab = filename => {
        this.props.dispatch({
            type: 'CLOSE_FILE',
            filename: filename
        });
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

        const { activeFile } = this.props.editor;

        return <div style={style}>
            <ul style={headerStyle}>
                {this.props.editor.openFiles.map(filename => {
                    return <Tab
                        key={filename}
                        active={filename === activeFile}
                        label={filename}
                        onClick={() => this.selectTab(filename)}
                        onCloseTab={this.handleCloseTab}
                    />;
                })}
            </ul>
            <div style={editorStyle} ref="container"></div>
        </div>;
    }
}

const select = state => state;

module.exports = connect(select)(Editor);
