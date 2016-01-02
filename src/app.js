const React = require('react');

const { Component } = React;

const Browser = require('./browser.js');
const Editor = require('./editor.js');
const store = require('./store.js');

const lintWorker = new Worker('build/lint_worker.js');
const transformWorker = new Worker('build/transform_worker.js');

lintWorker.addEventListener('message', function(message) {
    console.log(message.data.messages);
});

transformWorker.addEventListener('message', function(message) {
    //console.log(message.data.code);
});


class App extends Component {
    constructor() {
        super();

        this.state = {
            fileList: {
                'main.js': 'console.log("hello, world!");\nconst foo = "bar";',
                'sprites.js': "class Sprite {\n    constructor() { }\n}\n",
                'menu.js': ""
            }
        };
    }

    handleChange = (selectedFile, code) => {

    };

    handleOpenFile = file => {

    };

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
                width={800}
                height={600}
                fontSize={14}
                onChange={this.handleChange}
            />
        </div>;
    }
}

module.exports = App;
