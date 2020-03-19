const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const devMode = {
    mode: 'development',
    entry: './src/index.ts',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.ts$/,
                include: /src/,
                exclude: /(node_modules)/,
                loader: "ts-loader"
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'pavlang.js',
        libraryTarget: 'commonjs'
    }
};

module.exports = [
    devMode,
    {
        ...devMode,
        mode: 'production',
        optimization: {
            minimizer: [new UglifyJsPlugin({
                extractComments: true,
                sourceMap: false,
                include: /dist/
            })]
        }
    }
]

