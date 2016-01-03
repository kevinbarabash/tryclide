importScripts('../lib/babel.min.js');

self.addEventListener('message', e => {
    const {code, filename} = e.data;

    try {
        const result = Babel.transform(code, {
            presets: ['es2015'],
        });

        self.postMessage({
            code: result.code,
            filename: filename
        });
    } catch (e) {
        console.log(e);
        // TODO: pass error back to editor
    }
});
