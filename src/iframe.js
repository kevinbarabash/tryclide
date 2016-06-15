const modules = {};
const compiledFiles = {};
const sourceFiles = {};

const srcUrlToBlobUrl = {};
const blobUrlToSrcUrl = {};

const syncLoad = (url) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send();
    return xhr.responseText;
};

compiledFiles['react'] = syncLoad('lib/react.js');
compiledFiles['react-dom'] = syncLoad('lib/react-dom.js');

const babelWorker = new Worker('src/babel_worker.js');

// TODO: update babelWorker to post a message if the compile fails
const compile = function(filename, code) {
    console.log(`compiling ${filename}`);
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

// TODO: feed a custom requestAnimationFrame function to all scripts and require contexts
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
            const module = {
                exports: {}
            };

            try {
                const func = new Function("module", "exports", code);
                func(module, module.exports);
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

Set.prototype.difference = function(other) {
    return new Set([...this].filter(item => !other.has(item)));
};

Set.prototype.intersection = function(other) {
    return new Set([...this].filter(item => other.has(item)));
};

Set.prototype.toString = function() {
    return `{${[...this].join(', ')}}`;
};

function addLink(srcUrl) {
    if (sourceFiles.hasOwnProperty(srcUrl)) {
        const src = sourceFiles[srcUrl];
        const blob = new Blob([src], {type : 'text/css'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('link');

        link.rel = 'stylesheet';
        link.href = url;
        link.setAttribute('src-url', srcUrl);
        document.head.appendChild(link);

        blobUrlToSrcUrl[url] = srcUrl;
        srcUrlToBlobUrl[srcUrl] = url;
    } else {
        console.warn(`can't find ${srcUrl}`);
    }
}

function updateLink(link, srcUrl) {
    console.log(`updating ${srcUrl}`);
    const src = sourceFiles[srcUrl];
    const blob = new Blob([src], {type : 'text/css'});
    const url = URL.createObjectURL(blob);
    link.href = url;

    delete blobUrlToSrcUrl[link.href];
    blobUrlToSrcUrl[url] = srcUrl;
    srcUrlToBlobUrl[srcUrl] = url;
}

function replaceScript(script) {
    const srcUrl = script.getAttribute('src');

    if (compiledFiles.hasOwnProperty(srcUrl)) {
        const code = compiledFiles[srcUrl];
        const blob = new Blob([code], {type : 'text/javascript'});

        const newScript = document.createElement('script');

        newScript.src = URL.createObjectURL(blob);
        newScript.type = 'text/javascript';

        script.parentElement.replaceChild(newScript, script);
    } else {
        console.warn(`can't find '${srcUrl}`);
    }
}

window.addEventListener('message', e => {
    const oldFilenames = new Set(Object.keys(sourceFiles));
    const newFilenames = new Set(Object.keys(e.data.files));

    const addedFilenames = newFilenames.difference(oldFilenames);
    const removedFilenames = oldFilenames.difference(newFilenames);
    const remainingFilenames = newFilenames.intersection(oldFilenames);

    console.log(`addedFilenames = ${addedFilenames}`);
    console.log(`removedFilenames = ${removedFilenames}`);
    console.log(`remainingFilenames = ${remainingFilenames}`);

    for (const removal of removedFilenames) {
        // do we need to cache both?
        delete sourceFiles[removal];
        delete compiledFiles[removal];
    }

    // changedFiles may also include new files... these are files that need to
    // be compiled.
    const changedFiles = Object.keys(e.data.files).filter(
        filename => e.data.files[filename].contents !== sourceFiles[filename]
    );

    console.log(`changedFiles = ${changedFiles}`);

    for (const filename of changedFiles) {
        sourceFiles[filename] = e.data.files[filename].contents;
    }

    // TODO: if a user makes a change interrupt current processing
    (async () => {

        // Compile files

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

        // Update document

        const html = sourceFiles['index.html'];
        const parser = new DOMParser();
        const dom = parser.parseFromString(html, 'text/html');

        // document.head is read-only so we have to manually copy items over.
        // We remove all <link> tags before re-adding them so that the order of
        // <link> tags is always the same as in the source file.

        [...document.head.querySelectorAll('link')]
            .forEach(child => child.remove());

        [...dom.head.querySelectorAll('link')]
            .forEach(child => {
                addLink(child.getAttribute('href'));
            });

        document.body = dom.body;

        // <script> tags are not executed when replacing document.body so we
        // need to go through all of the scripts tags and replace them with
        // new <script> tags programmatically so that they are executed.

        const scripts = Array.from(document.body.querySelectorAll('script'));
        scripts.forEach(script => replaceScript(script));


        // // TODO: since requestAnimationFrame gets called every 16ms
        // // we could redefine it so that it doesn't call the original
        // // and then when it gets called again because there's still
        // // stuff in the queue it will stop looping
        // const requestAnimationFrame = createRequestAnimationFrame();
        // window.requestAnimationFrame = requestAnimationFrame;
        //
        // try {
        //     func(requestAnimationFrame);
        // } catch (e) {
        //     // TODO: report runtime error to parent frame
        //     console.log(e);
        // } finally {
        //     inProgress = false;
        // }
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
