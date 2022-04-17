import { CHUNK_ID_PLACEHOLDER } from '../Constants'
import type { LoaderContext } from 'webpack'
import type { VueSsrAssetsServerPluginOptions } from './VueSsrAssetsServerPluginOptions'

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VueSsrAssetsServerPluginLoader(this: LoaderContext<VueSsrAssetsServerPluginOptions>, source: string): string {
    const match = /export function ssrRender[^{]*{/.exec(source)
    if (!match) {
        return source
    }

    const importStatement = source.includes('useSSRContext') // Only import useSSRContext if it doesn't already exist in this file
        ? ''
        : 'import { useSSRContext } from "vue";'

    const options = this.getOptions()
    const ssrContextTracker = options.ssrContextTracker ?? '_matchedComponents'

    const injection = `;(() => {
        const ctx = useSSRContext();
        ctx.${ssrContextTracker}.add(${CHUNK_ID_PLACEHOLDER});
    })();`

    const startOfSsrRenderFn = match.index + match[0].length
    return '' +
        importStatement +
        source.slice(0, startOfSsrRenderFn) +
        injection +
        source.slice(startOfSsrRenderFn)
}
