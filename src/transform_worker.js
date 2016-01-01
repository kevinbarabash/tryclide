importScripts('../lib/babel.min.js');

self.addEventListener('message', e => {
    const {code} = e.data;

    try {
        const start = Date.now();
        const result = Babel.transform(code, {
            presets: ['es2015'],
            compact: true,
        });
        console.log("elapsed = " + (Date.now() - start));

        self.postMessage({
            channel: 'transform',
            code: result.code
        });
    } catch (e) {
        console.log(e);
        // TODO: pass error back to editor
    }
});
