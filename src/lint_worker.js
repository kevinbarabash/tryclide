importScripts('../lib/eslint.js');

self.addEventListener('message', e => {
    const {code} = e.data;

    try {
        const messages = eslint.verify(code, {
            rules: {
                semi: 2,
            },
            env: {
                browser: true,
                es6: true
            }
        });

        self.postMessage({
            channel: 'lint',
            messages: messages
        });
    } catch (e) {
        console.log(e);
        // TODO: pass error back to editor
    }
});
