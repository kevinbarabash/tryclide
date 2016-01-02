const { createStore } = require('redux');

const initialState = {
    files: {
        'index.html': '<html>\n<head>\n<link rel="stylesheet" type="text/css" href="style.css">\n</head>\n<body>\n<h1>Hello, world</h1>\n<script src="main.js"></script>\n</body>\n</html>\n',
        'styles.css': 'h1 {\n    color: blue;\n}\n',
        'main.js': 'console.log("hello, world!");\n'
    },
    editor: {
        openFiles: ['index.html', 'styles.css'],
        activeFile: 'index.html'
    }
};

const editorReducer = (state = initialState, action) => {
    let openFiles;

    switch (action.type) {
        case 'OPEN_FILE':
            openFiles = state.editor.openFiles;

            if (!openFiles.includes(action.filename)) {
                openFiles = [...openFiles, action.filename];
            }

            return {
                ...state,
                editor: {
                    ...state.editor,
                    openFiles,
                    activeFile: action.filename
                }
            };
        case 'CLOSE_FILE':
            openFiles = state.editor.openFiles;
            openFiles = openFiles.filter(file => file !== action.filename);

            return {
                ...state,
                editor: {
                    ...state.editor,
                    openFiles,
                    activeFile: openFiles[0]
                }
            };
        case 'UPDATE_FILE':
            // TODO: check that there's an active file
            return {
                ...state,
                files: {
                    ...state.files,
                    [state.editor.activeFile]: action.code
                }
            };
        case 'SELECT_TAB':
            return {
                ...state,
                editor: {
                    ...state.editor,
                    activeFile: action.filename
                }
            };
        default:
            return state;
    }
};

module.exports = createStore(editorReducer);
