'use strict';

const webpack = require('webpack');
const path = require('path');
const rootPath = path.join(__dirname, '../');
const config = require(path.join(rootPath, 'package.json'));

const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const HTMLWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

const baseConfig = require('./base.config.js');

module.exports = function () {
    let distConfig = baseConfig;
    // distConfig.devtool = 'inline-source-map';
    distConfig.mode = 'production';
    distConfig.output = {
        path: path.join(rootPath, '_build/dist'),
        publicPath: '/',
        filename: config.name + '.min.js'
    };
    distConfig.plugins = distConfig.plugins.concat([
        new webpack.DefinePlugin({
            'DEBUG': false
        }),
        new CleanWebpackPlugin(),
        new HTMLWebpackPlugin({
            template: 'sources/index.html',
            filename: 'time_report_template.html',
            inlineSource: '.(js)$',
            // inject: false,
            scriptLoading: 'module',
            templateParameters: {
                config: config,
                buildDate: new Date
            },
            reportData: '{{{json-data}}}'
        }),
        new HtmlWebpackInlineSourcePlugin(HTMLWebpackPlugin)
    ]);
    distConfig.optimization = {
        minimizer: [
            new TerserPlugin(
                {
                    parallel: 4,
                    // sourceMap: false,
                    extractComments: false,
                    terserOptions: {
                        output: {
                            comments: false,
                        },
                        compress: {
                            pure_funcs: ['console.info', 'console.log', 'console.debug', 'console.warn']
                        }
                    }
                }
            )
        ],
    };
    return distConfig;
};