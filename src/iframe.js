const modules = {};
const compiledFiles = {};
const sourceFiles = {};

const babelWorker = new Worker('src/babel_worker.js');

const compile = function(filename, code) {
    return new Promise((resolve, reject) => {
        babelWorker.postMessage({
            filename: filename,
            code: code
        });
        babelWorker.addEventListener('message', e => {
            resolve(e.data);
        });
    });
};

const originalRequestAnimationFrame = window.requestAnimationFrame;
let i = 0;

const createRequestAnimationFrame = () => {
    const j = i++;
    const currentRequestAnimationFrame = callback => {
        console.log(j);
        if (window.requestAnimationFrame === currentRequestAnimationFrame) {
            originalRequestAnimationFrame(callback);
        }
    };
    return currentRequestAnimationFrame;
};

// TODO: differentiate local includes vs global modules
window.require = function(path) {
    if (modules[path]) {
        return modules[path];
    } else {
        const code = compiledFiles[path];

        if (code) {
            const module = {};

            try {
                const func = new Function("module", code);
                func(module);
                modules[path] = module.exports;
                return modules[path];
            } catch (e) {
                throw Error(`runtime error in ${path}`);
            }
        } else {
            throw Error(`${path} module doesn't exist`);
        }
    }
};

let inProgress = false;

window.addEventListener('message', e => {
    if (inProgress) {
        return;
    } else {
        inProgress = true;
    }

    const changedFiles = Object.keys(e.data.files).filter(
        filename => e.data.files[filename] !== sourceFiles[filename]
    );

    for (const filename of changedFiles) {
        const code = e.data.files[filename];

        sourceFiles[filename] = code;
    }

    // TODO: if a user makes a change interrupt current processing
    (async () => {
        for (var i = 0; i < changedFiles.length; i++) {
            const filename = changedFiles[i];
            if (!filename.endsWith('.js')) {
                continue;
            }

            const code = sourceFiles[filename];

            if (code) {
                const result = await compile(filename, code);
                compiledFiles[result.filename] = result.code;
                delete modules[filename];
            }
            // TODO: send messages of compilation progress
        }

        const html = sourceFiles['index.html'];
        const parser = new DOMParser();
        const dom = parser.parseFromString(html, 'text/html');
        document.body = dom.body;
        for (var i = 0; i < dom.head.children.length; i++) {
            const child = dom.head.children[i];

            // TODO: only add links for stylesheets that have changed
            // TODO: keep a dictionary so we can remove old stylesheets
            if (child.tagName === 'LINK') {
                const href = child.getAttribute('href');
                const src = sourceFiles[href];

                const blob = new Blob([src], {type : 'text/css'});
                const url = URL.createObjectURL(blob);

                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = url;

                document.head.appendChild(link);
                // TODO: create a URL param from src
            }
        }

        const main = compiledFiles['main.js'];
        const func = new Function("requestAnimationFrame", main);

        // TODO: since requestAnimationFrame gets called every 16ms
        // we could redefine it so that it doesn't call the original
        // and then when it gets called again because there's still
        // stuff in the queue it will stop looping
        const requestAnimationFrame = createRequestAnimationFrame();
        window.requestAnimationFrame = requestAnimationFrame;

        try {
            func(requestAnimationFrame);
        } catch (e) {
            // TODO: report runtime error to parent frame
            console.log(e);
        } finally {
            inProgress = false;
        }
    })();
});

window.addEventListener('error', e => {
    // TODO: figure out how to get better stack traces, maybe use blobs
    // if we use async/await for require statements then this might work
    console.log('runtime error: %o', e);
    console.log('stack trace:');
    console.log(e.error.stack);
    e.stopPropagation();
    e.preventDefault();
});
