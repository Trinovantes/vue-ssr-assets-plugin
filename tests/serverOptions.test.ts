import { VueSsrAssetsServerPluginOptions, validateServerPluginOptions } from '@/server/VueSsrAssetsServerPluginOptions'
import { describe, test, expect } from 'vitest'

describe('VueSsrAssetsServerPluginOptions', () => {
    test('no options', () => {
        const options: VueSsrAssetsServerPluginOptions = {}

        expect(validateServerPluginOptions(options)).toBe(true)
    })

    test('string ssrContextTracker', () => {
        const options: VueSsrAssetsServerPluginOptions = {
            ssrContextTracker: 'foundComponents',
        }

        expect(validateServerPluginOptions(options)).toBe(true)
    })

    test('non string ssrContextTracker should throw', () => {
        const options = {
            ssrContextTracker: 42,
        }

        expect(() => validateServerPluginOptions(options)).toThrow()
    })
})
