const { createStore } = require('redux');

const timestamp = Date.now();

const defaultInitialState = {
    files: {
        'index.html': {
            contents: '<html>\n<head>\n<link rel="stylesheet" type="text/css" href="styles1.css">\n<link rel="stylesheet" type="text/css" href="styles2.css">\n</head>\n<body>\n<h1>Hello, world</h1>\n<h2>goodbye, world</h2>\n<script src="main.js"></script>\n</body>\n</html>\n',
            timestamp: timestamp
        },
        'styles1.css': {
            contents: 'h1 {\n    color: blue;\n}\n',
            timestamp: timestamp
        },
        'styles2.css': {
            contents: 'h2 {\n    color: red;\n}\n',
            timestamp: timestamp
        },
        'main.js': {
            contents: 'const message = require("message.js");\nconsole.log(message);\n',
            timestamp: timestamp
        },
        'message.js': {
            contents: 'module.exports = "hello, world!";\n',
            timestamp: timestamp
        }
    },
    editor: {
        openFiles: ['index.html', 'styles1.css', 'styles2.css'],
        activeFile: 'index.html',
        selectedFile: 'index.html',
    }
};

const initialState = JSON.parse(localStorage.getItem("tryclideState")) || defaultInitialState;

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
            return {
                ...state,
                files: {
                    ...state.files,
                    [state.editor.activeFile]: {
                        contents: action.code,
                        timestamp: Date.now()
                    }
                }
            };
        case 'RENAME_FILE':
            const files = { ...state.files };
            files[action.new_filename] = files[action.old_filename];
            delete files[action.old_filename];

            return {
                ...state,
                files
            };
        case 'NEW_FILE':
            return {
                ...state,
                files: {
                    ...state.files,
                    'undefined': {
                        contents: '',
                        timestamp: Date.now()
                    }
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

const localStorageReducer = (state = initialState, action) => {
    const newState = editorReducer(state, action);
    localStorage.setItem("tryclideState", JSON.stringify(newState));
    return newState;
};

module.exports = createStore(localStorageReducer);
