const babel = require('babel-core');
const es2015 = require('babel-preset-es2015-loose');

self.addEventListener('message', e => {
    const {code} = e.data;

    try {
        const start = Date.now();
        const result = babel.transform(code, {
            presets: [es2015],
            compact: true,

        });
        console.log("elapsed = " + (Date.now() - start));

        self.postMessage({
            channel: 'transform',
            code: result.code
        });
    } catch (e) {
        // TODO: pass error back to editor
    }
});
