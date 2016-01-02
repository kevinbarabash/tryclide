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
            const func = new Function("module", code);
            func(module);
            modules[path] = module.exports;
            return modules[path];
        } else {
            throw Error("module doesn't exist");
        }
    }
};

window.addEventListener('message', function(e) {
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
