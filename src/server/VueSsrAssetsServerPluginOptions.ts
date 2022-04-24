import Ajv from 'ajv'

export interface VueSsrAssetsServerPluginOptions {
    ssrContextTracker?: string
}

const ajv = new Ajv({ useDefaults: true })
const validator = ajv.compile({
    type: 'object',
    properties: {
        ssrContextTracker: {
            type: 'string',
            default: '_matchedComponents',
        },
    },
})

export function validateServerPluginOptions(options: unknown): options is Required<VueSsrAssetsServerPluginOptions> {
    const isValid = validator(options)
    if (!isValid) {
        console.warn('Invalid VueSsrAssetsServerPluginOptions', validator.errors)
        throw new Error('Invalid VueSsrAssetsServerPluginOptions')
    }

    return isValid
}
