import { VueSsrAssetsClientPluginOptions, validateClientPluginOptions } from '@/client/VueSsrAssetsClientPluginOptions'
import { describe, test, expect } from 'vitest'

describe('VueSsrAssetsClientPluginOptions', () => {
    test('no options should throw', () => {
        const options = {}

        expect(() => validateClientPluginOptions(options)).toThrow()
    })

    test('non string fileName should throw', () => {
        const options = {
            fileName: 42,
        }

        expect(() => validateClientPluginOptions(options)).toThrow()
    })

    test('string fileName', () => {
        const options: VueSsrAssetsClientPluginOptions = {
            fileName: 'ssr-manifest.json',
        }

        expect(validateClientPluginOptions(options)).toBe(true)
    })
})
