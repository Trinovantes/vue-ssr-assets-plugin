import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        silent: Boolean(process.env.CI),
        dir: './tests',
    },
})
