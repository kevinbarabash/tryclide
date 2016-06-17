importScripts('../lib/babel.min.js');

self.addEventListener('message', e => {
    const {code, filename, scope} = e.data;

    // These transforms are necessary for code running in the global context
    const globalTransforms = [
        'transform-es2015-block-scoping',
        'transform-es2015-classes'
    ];

    try {
        const start = Date.now();
        const result = Babel.transform(code, {
            presets: ['react'],
            plugins: scope === 'global' ? globalTransforms : []
        });

        self.postMessage({
            code: result.code,
            filename: filename
        });
        const elapsed = Date.now() - start;
        console.log(`elapsed = ${elapsed}`);
    } catch (e) {
        console.log(e);
        // TODO: pass error back to editor
    }
});
