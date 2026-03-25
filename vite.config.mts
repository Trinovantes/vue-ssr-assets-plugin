import path from 'node:path'
import { defineConfig } from 'vitest/config'
import dts from 'vite-plugin-dts'
import pkg from './package.json'

export default defineConfig({
    test: {
        silent: Boolean(process.env.CI),
        dir: './tests',
    },

    build: {
        minify: false,
        sourcemap: true,

        lib: {
            entry: path.resolve(__dirname, './src/index.ts'),
            fileName: 'index',
            formats: ['cjs'],
        },

        rollupOptions: {
            external: [
                /^node:.*/,
                ...Object.keys(pkg.dependencies),
                ...Object.keys(pkg.peerDependencies),
            ],
        },
    },

    plugins: [
        dts({
            insertTypesEntry: true,
            tsconfigPath: path.resolve(__dirname, './tsconfig.prod.json'),
        }),
    ],
})
