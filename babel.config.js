module.exports = {
    presets: [
        '@babel/preset-env',
        '@babel/preset-typescript',
    ],

    plugins: [
        [
            '@babel/transform-runtime',
        ],
        [
            'babel-plugin-root-import',
            {
                paths: [
                    {
                        rootPathSuffix: './src/',
                        rootPathPrefix: 'src',
                    },
                ],
            },
        ],
        [
            'transform-define',
            {
                'DEFINE.IS_DEV': true,
            },
        ],
    ],
}
