import Ajv from 'ajv'

export interface VueSsrAssetsClientPluginOptions {
    fileName: string
}

const ajv = new Ajv()
const validator = ajv.compile({
    type: 'object',
    required: ['fileName'],
    properties: {
        fileName: {
            type: 'string',
        },
    },
})

export function validateClientPluginOptions(options: unknown): options is VueSsrAssetsClientPluginOptions {
    const isValid = validator(options)
    if (!isValid) {
        console.warn('Invalid VueSsrAssetClientPluginOptions', validator.errors)
        throw new Error('Invalid VueSsrAssetClientPluginOptions')
    }

    return isValid
}
