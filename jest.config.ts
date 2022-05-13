import type { Config } from '@jest/types/build/index'

const config: Config.InitialOptions = {
    bail: true,

    setupFiles: [
        './tests/setup.ts',
    ],
}

export default config
