'use strict';

const webpack = require('webpack');
const path = require('path');
const rootPath = path.join(__dirname, '../');
const config = require(path.join(rootPath, 'package.json'));

module.exports = {
    entry: path.join(rootPath, 'ts/app.ts'),
    plugins: [
        new webpack.DefinePlugin({
            'STORAGE_KEY': JSON.stringify(config.name),
            'VERSION': JSON.stringify(config.version)
        })
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
};