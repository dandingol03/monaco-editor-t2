'use strict';

const webpack = require('webpack');
const path = require('path');

const MonacoEditorSrc = path.join(__dirname, 'src');

module.exports = {
    devtool: "eval-source-map",
    debug: true,
    entry: {
        app:['webpack/hot/dev-server','./web/src/scripts/index.jsx']
    }
    ,
    output: {
        path: path.join(__dirname, './build'),
        filename: 'bundle.js',
        publicPath:'http://localhost:8013/build/'
    },
    target: 'electron-renderer',
    module: {
        loaders: [
            {
                test: /\.html$/,
                loader: 'file?n`ame=[name].[ext]',
            },
            {
                test: /\.json$/,
                loader: 'json',
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loaders: [
                    'react-hot',
                    'babel-loader',
                ],
            },
            { test: /\.(png|svg)$/, loader: "url-loader?limit=100000" },
            { test: /\.jpg$/, loader: "file-loader" },

            {
                test: /\.jsx?$/,
                loaders: ['babel?presets[]=es2015,presets[]=react,presets[]=stage-0,plugins[]=transform-decorators-legacy'],
                exclude: /node_modules/
            },
            // { test: /\.jsx?$/, loaders: ['react-hot', 'babel'], include: path.join(__dirname, 'app/src/scripts'), exclude: '/node_modules/'},
            { test: /\.css$/, loaders: ['style', 'css']},

        ],
    },
    resolve: {
        extensions: ['', '.js', '.jsx', '.json'],
        alias: {
            'react-monaco-editor': MonacoEditorSrc
        }
    },
    plugins: [

        new webpack.NoErrorsPlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.DefinePlugin({
            'process.env': { NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development') },
        }),
        new webpack.SourceMapDevToolPlugin({
            exclude: /node_modules/,
        }),
    ],
    devServer: {
        contentBase: './',
        hot: true,
        port: 8013,
        publicPath: 'http://localhost:8013/build/',
        inline: true,
    },
}
