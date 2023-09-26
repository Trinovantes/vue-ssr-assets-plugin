import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },

    test: {
        silent: Boolean(process.env.CI),
        dir: './tests',
    },
})
