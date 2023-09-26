import { Type, Static } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'

const tbVueSsrAssetsServerPluginOptions = Type.Object({
    ssrContextTracker: Type.Optional(Type.String()),
})

export type VueSsrAssetsServerPluginOptions = Static<typeof tbVueSsrAssetsServerPluginOptions>

export function validateServerPluginOptions(options: unknown): options is VueSsrAssetsServerPluginOptions {
    if (!Value.Check(tbVueSsrAssetsServerPluginOptions, options)) {
        throw new Error('Invalid VueSsrAssetsServerPluginOptions')
    }

    return true
}
