import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
    bail: true,

    setupFiles: [
        './tests/setup.ts',
    ],
}

export default config
