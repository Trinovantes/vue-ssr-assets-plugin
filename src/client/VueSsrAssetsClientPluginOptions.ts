import { Type, Static } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'

const tbVueSsrAssetsClientPluginOptions = Type.Object({
    fileName: Type.String(),
})

export type VueSsrAssetsClientPluginOptions = Static<typeof tbVueSsrAssetsClientPluginOptions>

export function validateClientPluginOptions(options: unknown): options is VueSsrAssetsClientPluginOptions {
    if (!Value.Check(tbVueSsrAssetsClientPluginOptions, options)) {
        throw new Error('Invalid VueSsrAssetsClientPluginOptions')
    }

    return true
}
