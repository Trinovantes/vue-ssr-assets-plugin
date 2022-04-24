import type { VueSsrAssetsServerPluginOptions } from './VueSsrAssetsServerPluginOptions'

export type VueSsrAssetsServerLoaderOptions = {
    componentName: string
    isScriptSetup: boolean
} & Required<VueSsrAssetsServerPluginOptions>
