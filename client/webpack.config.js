// `CheckerPlugin` is optional. Use it if you want async error reporting.
// We need this plugin to detect a `--watch` mode. It may be removed later
// after https://github.com/webpack/webpack/issues/3460 will be resolved.
const {CheckerPlugin} = require('awesome-typescript-loader');
const path = require('path');

module.exports = {
    entry: {
        main: './src/main.ts'
    },
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, 'dist'),
        sourceMapFilename: "./[name].js.map",
    },
    // Currently we need to add '.ts' to the resolve.extensions array.
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        modules: ['/usr/local/lib/node_modules']
    },
    resolveLoader: {
        modules: ['/usr/local/lib/node_modules'],
        // extensions: ['.js', '.json'],
        // mainFields: ['loader', 'main']
    },
    // Source maps support ('inline-source-map' also works)
    //devtool: 'source-map',  // chrome does not work properly with it
    devtool: 'inline-module-source-map',

    // Add the loader for .ts files.
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader'
            }
        ]
    },
    plugins: [
        new CheckerPlugin()
    ]
};
