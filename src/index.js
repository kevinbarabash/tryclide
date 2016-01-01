const lintWorker = new Worker('build/lint_worker.js');
const transformWorker = new Worker('build/transform_worker.js');

const editor = ace.edit("editor");
editor.setTheme("ace/theme/chrome");

const session = editor.getSession();
session.setMode("ace/mode/javascript");
session.setUseWorker(false);

// TODO: add multiple tabs to the editor
editor.on('change', function(e) {

    const code = editor.getValue();

    // TODO: debounce changes
    lintWorker.postMessage({
        code: code
    });

    transformWorker.postMessage({
        code: code
    });
});

lintWorker.addEventListener('message', function(message) {
    console.log(message.data.messages);
});

transformWorker.addEventListener('message', function(message) {
    //console.log(message.data.code);
});
