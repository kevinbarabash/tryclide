var path = require('path');

module.exports = {
    entry: {
        'lint_worker': './src/lint_worker.js',
        'transform_worker': './src/transform_worker.js',
        'index': './src/index.js',
    },
    output: {
        path: path.join(__dirname, 'build'),
        filename: '[name].js',
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel',
            include: path.join(__dirname, 'src')
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
