const modules = {};
const files = {};

// TODO: differentiate local includes vs global modules
const require = function(path) {
    if (modules[path]) {
        return modules[path];
    } else {
        if (files[path]) {
            const module = {};
            const code = files[path];
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

window.addEventListener('message', e => {
    Object.keys(e.data.files).forEach(filename => {
        if (e.data.files[filename] !== files[filename]) {
            delete modules[filename];
            files[filename] = e.data.files[filename];
        }
    });

    const html = files['index.html'];

    const parser = new DOMParser();
    const dom = parser.parseFromString(html, 'text/html');
    console.log(dom.body);

    document.body = dom.body;

    const main = files['main.js'];
    const func = new Function(main);
    func();
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
