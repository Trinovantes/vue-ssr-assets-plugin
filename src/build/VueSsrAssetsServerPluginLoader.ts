import { CHUNK_ID_PLACEHOLDER } from '../Constants'
import type { LoaderContext } from 'webpack'
import type { VueSsrAssetsServerPluginOptions } from './VueSsrAssetsServerPluginOptions'
import type { VueSsrAssetsServerPluginLoaderOptions } from './VueSsrAssetsServerPluginLoaderOptions'

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VueSsrAssetsServerPluginLoader(this: LoaderContext<VueSsrAssetsServerPluginOptions & VueSsrAssetsServerPluginLoaderOptions> & { target: string }, source: string): string {
    // Only instrument SSR builds that target node
    if (this.target !== 'node') {
        return source
    }

    const options = this.getOptions()
    const ssrContextTracker = options.ssrContextTracker ?? '_matchedComponents'

    const regex = options.isScriptSetup
        ? /<script.*?setup.*?>/
        : /export function ssrRender[^{]*{/

    const match = regex.exec(source)
    if (!match) {
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

    const modifiedSource = options.isScriptSetup
        ? source.slice(0, injectionPoint) + importStatement + injection + source.slice(injectionPoint)
        : importStatement + source.slice(0, injectionPoint) + injection + source.slice(injectionPoint)

    return modifiedSource
}
