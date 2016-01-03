var path = require('path');

module.exports = {
    entry: {
        'index': './src/index.js',
        'iframe': './src/iframe.js',
    },
    output: {
        path: path.join(__dirname, 'build'),
        filename: '[name].js',
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel',
            include: path.join(__dirname, 'src'),
            query: {
                presets: ['es2015', 'react'],
                plugins: [
                    'transform-class-properties',
                    'syntax-object-rest-spread',
                    'transform-object-rest-spread',
                    'syntax-async-functions',
                    'transform-async-to-generator'
                ]
            }
        }, {
            test: /\.json$/,
            loader: 'json'
        }]
    },
    node: {
        fs: "empty",
        net: "empty",
        module: "empty",
        child_process: "empty",
        readline: "empty",
    }
};
