import { VueSsrAssetsServerPluginOptions, validateServerPluginOptions } from '../src/server/VueSsrAssetsServerPluginOptions'

describe('VueSsrAssetsServerPluginOptions', () => {
    test('no options', () => {
        const options: VueSsrAssetsServerPluginOptions = {}

        expect(validateServerPluginOptions(options)).toBe(true)
        expect(typeof options.ssrContextTracker).toBe('string')
    })

    test('non string ssrContextTracker should throw', () => {
        const options = {
            ssrContextTracker: 42,
        }

        expect(() => validateServerPluginOptions(options)).toThrow()
    })
})
