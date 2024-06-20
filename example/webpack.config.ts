import path from 'node:path'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { VueLoaderPlugin } from 'vue-loader'
import { Configuration, DefinePlugin } from 'webpack'
import merge from 'webpack-merge'
import { VueSsrAssetsClientPlugin, VueSsrAssetsServerPlugin } from '../src'

// ----------------------------------------------------------------------------
// Constants
// ----------------------------------------------------------------------------

// Assume we are running webpack from the project root (../)
const rootDir = path.resolve()

export const isDev = (process.env.NODE_ENV === 'development')
export const publicPath = '/public/'

export const distServerDir = path.resolve(rootDir, 'dist', 'example')
export const distClientDir = path.resolve(distServerDir, 'public')
export const manifestFile = path.resolve(distServerDir, 'ssr-manifest.json')

export const srcDir = path.resolve(rootDir, 'example', 'src')
export const staticDir = path.resolve(srcDir, 'static')

// ----------------------------------------------------------------------------
// Common
// ----------------------------------------------------------------------------

const commonConfig: Configuration = {
    mode: isDev
        ? 'development'
        : 'production',

    devtool: 'source-map',

    output: {
        publicPath,
    },

    resolve: {
        extensions: ['.ts', '.js', '.vue', '.json', 'scss', '.css'],
    },

    plugins: [
        new DefinePlugin({
            '__VUE_OPTIONS_API__': JSON.stringify(true),
            '__VUE_PROD_DEVTOOLS__': JSON.stringify(false),
            '__VUE_PROD_HYDRATION_MISMATCH_DETAILS__': JSON.stringify(false),

            'DEFINE.PUBLIC_PATH': JSON.stringify(publicPath),
            'DEFINE.CLIENT_DIST_DIR': JSON.stringify(distClientDir),
            'DEFINE.MANIFEST_FILE': JSON.stringify(manifestFile),
        }),
        new VueLoaderPlugin(),
    ],

    optimization: {
        minimize: false,
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'esbuild-loader',
                    options: {
                        loader: 'ts',
                        target: 'es2020',
                    },
                }],
            },
            {
                test: /\.vue$/,
                use: [{
                    loader: 'vue-loader',
                }],
            },
        ],
    },
}

// ----------------------------------------------------------------------------
// Client
// ----------------------------------------------------------------------------

const clientEntryConfig = merge(commonConfig, {
    target: 'web',

    entry: {
        main: `${srcDir}/entryClient.ts`,
    },

    output: {
        path: distClientDir,
        filename: isDev
            ? '[name].js'
            : '[name].[contenthash].js',
    },

    module: {
        rules: [
            {
                test: /\.(css|sass|scss)$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            additionalData: (content: string, loaderContext: { resourcePath: string }): string => {
                                return (loaderContext.resourcePath.endsWith('sass'))
                                    ? '@use "sass:math"\n' + content
                                    : '@use "sass:math"; ' + content
                            },
                        },
                    },
                ],
            },
            {
                test: /\.(ttf|eot|woff2?)$/,
                type: 'asset',
            },
        ],
    },

    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: staticDir,
                    to: distClientDir,
                },
            ],
        }),
        new MiniCssExtractPlugin({
            filename: isDev
                ? '[name].css'
                : '[name].[contenthash].css',
        }),
        new VueSsrAssetsClientPlugin({
            fileName: manifestFile,
        }),
    ],
})

// ----------------------------------------------------------------------------
// Server
// ----------------------------------------------------------------------------

const serverEntryConfig = merge(commonConfig, {
    target: 'node',

    entry: {
        www: `${srcDir}/entryServer.ts`,
    },

    output: {
        path: distServerDir,
        libraryTarget: 'commonjs2',
    },

    module: {
        rules: [
            {
                // Do not emit css in the server bundle
                test: /\.(css|sass|scss)$/,
                use: 'null-loader',
            },
            {
                test: /\.(ttf|eot|woff2?)$/,
                use: 'null-loader',
            },
        ],
    },

    plugins: [
        new VueSsrAssetsServerPlugin(),
    ],

    externals: [
        'express',
    ],
})

// ----------------------------------------------------------------------------
// Exports
// ----------------------------------------------------------------------------

export default [
    clientEntryConfig,
    serverEntryConfig,
]
