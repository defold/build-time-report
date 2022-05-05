'use strict';

const webpack = require('webpack');
const path = require('path');
const rootPath = path.join(__dirname, '../');
const config = require(path.join(rootPath, 'package.json'));

const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const baseConfig = require('./base.config.js');
const HTMLWebpackPlugin = require('html-webpack-plugin')

module.exports = function () {
    let devConfig = baseConfig;
    devConfig.devtool = 'inline-source-map';
    devConfig.cache = true;
    devConfig.mode = 'development';
    // devConfig.target = 'web';
    devConfig.devServer = {
        index: 'index.html',
        contentBase: '_build/dev',
        port: config.port,
        hot: true,
        writeToDisk: true,
        watchContentBase: true
    };
    devConfig.output = {
        path: path.join(rootPath, '_build/dev'),
        filename: config.name + '.min.js',
        hotUpdateChunkFilename: '../.temp/.hot/hot-update.js',
        hotUpdateMainFilename: '../.temp/.hot/hot-update.json',
    };
    devConfig.plugins = devConfig.plugins.concat([
        new webpack.DefinePlugin({
            'DEBUG': true
        }),
        new HTMLWebpackPlugin({
            template: 'sources/index.html',
            filename: 'index.html',
            inject: true,
            templateParameters: {
                config: config,
                buildDate: new Date
            },
            reportData: '{"data":[{"name":"foo","start":300,"duration":200,"type":"task","children":[{"name":"foo","start":310,"duration":50,"type":"sub-task","color":"#AA0000"}]}],"marks":[{"shortName":"DCL","fullName":"DOMContentLoaded","timestamp":500}]}'
        }),
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: [
                '**/*',
                '!../.temp/**',
            ],
            cleanAfterEveryBuildPatterns: ['!../.temp/**'],
            cleanStaleWebpackAssets: true
        })
    ]);
    return devConfig;
};