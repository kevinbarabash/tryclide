const { createStore } = require('redux');

const initialState = {
    files: {
        'index.html': '<html>\n<head>\n<link rel="stylesheet" type="text/css" href="styles1.css">\n<link rel="stylesheet" type="text/css" href="styles2.css">\n</head>\n<body>\n<h1>Hello, world</h1>\n<h2>goodbye, world</h2>\n<script src="main.js"></script>\n</body>\n</html>\n',
        'styles1.css': 'h1 {\n    color: blue;\n}\n',
        'styles2.css': 'h2 {\n    color: red;\n}\n',
        'main.js': 'const message = require("message.js");\nconsole.log(message);\n',
        'message.js': 'module.exports = "hello, world!";\n'
    },
    editor: {
        openFiles: ['index.html', 'styles1.css', 'styles2.css'],
        activeFile: 'index.html',
        selectedFile: 'index.html',
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
        case 'SELECT_FILE':
            return {
                ...state,
                editor: {
                    ...state.editor,
                    selectedFile: action.filename
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
            console.log(action);
            return {
                ...state,
                files: {
                    ...state.files,
                    [state.editor.activeFile]: action.code
                }
            };
        case 'RENAME_FILE':
            const files = { ...state.files };
            files[action.new_filename] = files[action.old_filename];
            delete files[action.old_filename];

            console.log(action);
            console.log(Object.keys(files));

            return {
                ...state,
                files
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
