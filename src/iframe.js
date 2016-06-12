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

window.addEventListener('message', e => {
    // if (inProgress) {
    //     return;
    // } else {
    //     inProgress = true;
    // }

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

        const cssLinks = [];
        for (var i = 0; i < dom.head.children.length; i++) {
            const child = dom.head.children[i];
            if (child.tagName === 'LINK') {
                cssLinks.push(child.getAttribute('href'));
            }
        }

        const linksToRemove = [];

        for (var i = 0; i < document.head.children.length; i++) {
            const child = document.head.children[i];
            if (child.tagName === 'LINK') {
                if (child.href in blobUrlToSrcUrl) {
                    const srcUrl = blobUrlToSrcUrl[child.href];

                    if (cssLinks.includes(srcUrl)) {
                        // TODO: only update if the source changed
                        // update
                        const src = sourceFiles[srcUrl];
                        const blob = new Blob([src], {type : 'text/css'});
                        const url = URL.createObjectURL(blob);
                        child.href = url;

                        delete blobUrlToSrcUrl[child.href];
                        blobUrlToSrcUrl[url] = srcUrl;
                        srcUrlToBlobUrl[srcUrl] = url;
                    } else {
                        // remove
                        delete blobUrlToSrcUrl[child.href];
                        delete srcUrlToBlobUrl[srcUrl];

                        linksToRemove.push(child);
                    }
                } else {
                    // this shouldn't happen
                }
            }
        }

        linksToRemove.forEach(link => link.remove());

        for (var i = 0; i < cssLinks.length; i++) {
            const srcUrl = cssLinks[i];
            if (!srcUrlToBlobUrl.hasOwnProperty(srcUrl)) {
                // add
                const src = sourceFiles[srcUrl];
                const blob = new Blob([src], {type : 'text/css'});
                const url = URL.createObjectURL(blob);
                const link = document.createElement('link');

                link.rel = 'stylesheet';
                link.href = url;
                document.head.appendChild(link);

                blobUrlToSrcUrl[url] = srcUrl;
                srcUrlToBlobUrl[srcUrl] = url;
            }
        }

        // Convert from NodeList to Array so it doesn't get modified as we
        // update the DOM.
        const scripts = Array.from(document.body.querySelectorAll('script'));

        scripts.forEach(script => {
            const srcUrl = script.getAttribute('src');
            const newChild = document.createElement('script');
            const code = compiledFiles[srcUrl];
            const blob = new Blob([code], {type : 'text/javascript'});
            const url = URL.createObjectURL(blob);

            newChild.src = url;
            newChild.type = 'text/javascript';

            script.parentElement.replaceChild(newChild, script);
        });

        // const main = compiledFiles['main.js'];
        // const func = new Function("requestAnimationFrame", main);
        //
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
