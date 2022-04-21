import { CHUNK_ID_PLACEHOLDER, PLUGIN_NAME } from '../Constants'
import type { LoaderContext } from 'webpack'
import type { VueSsrAssetsServerPluginOptions } from './VueSsrAssetsServerPluginOptions'
import type { VueSsrAssetsServerPluginLoaderOptions } from './VueSsrAssetsServerPluginLoaderOptions'

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VueSsrAssetsServerPluginLoader(this: LoaderContext<VueSsrAssetsServerPluginOptions & VueSsrAssetsServerPluginLoaderOptions>, source: string): string {
    const options = this.getOptions()
    const ssrContextTracker = options.ssrContextTracker ?? '_matchedComponents'

    const regex = options.isScriptSetup
        ? /setup\(__props\)\s+{/
        : /export function ssrRender[^{]*{/

    const match = regex.exec(source)
    if (!match) {
        const logger = this.getLogger(PLUGIN_NAME)
        logger.warn(`Failed to inject runtime code into "${options.componentName}"`)
        return source
    }

    const injectionPoint = match.index + match[0].length

    const importStatement = source.includes('useSSRContext') // Only import useSSRContext if it doesn't already exist in this file
        ? ''
        : 'import { useSSRContext } from "vue";'

    const injection = `;(() => {
        const ctx = useSSRContext();
        ctx.${ssrContextTracker}.add(${CHUNK_ID_PLACEHOLDER});
    })();`

    const modifiedSource = '' +
        importStatement +
        source.slice(0, injectionPoint) +
        injection +
        source.slice(injectionPoint)

    return modifiedSource
}
