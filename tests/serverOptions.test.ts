import { VueSsrAssetsServerPluginOptions, validateServerPluginOptions } from '@/server/VueSsrAssetsServerPluginOptions'

describe('VueSsrAssetsServerPluginOptions', () => {
    test('no options', () => {
        const options: VueSsrAssetsServerPluginOptions = {}

        expect(validateServerPluginOptions(options)).toBe(true)
        expect(typeof options.ssrContextTracker).toBe('string')
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
