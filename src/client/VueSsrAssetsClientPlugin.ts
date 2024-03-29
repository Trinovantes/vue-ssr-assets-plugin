import path from 'node:path'
import { sources, Compiler, WebpackPluginInstance, Compilation } from 'webpack'
import { PLUGIN_NAME } from '../Constants'
import { exportDependencyMap } from '../utils/exportDependencyMap'
import { findComponentDependencies } from '../utils/findComponentDependencies'
import { validateClientPluginOptions, VueSsrAssetsClientPluginOptions } from './VueSsrAssetsClientPluginOptions'

export class VueSsrAssetsClientPlugin implements WebpackPluginInstance {
    #options: VueSsrAssetsClientPluginOptions

    constructor(options: VueSsrAssetsClientPluginOptions) {
        validateClientPluginOptions(options)
        this.#options = options
    }

    apply(compiler: Compiler) {
        if (compiler.options.target !== 'web') {
            throw new Error('VueSsrAssetsClientPlugin should only be used for client bundles (target:"web")')
        }

        compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
            compilation.hooks.processAssets.tap({
                name: PLUGIN_NAME,
                stage: Compilation.PROCESS_ASSETS_STAGE_PRE_PROCESS,
            }, () => {
                const outputDir = compiler.options.output.path ?? './'
                const outputRelPath = path.relative(outputDir, this.#options.fileName)

                const dependenciesMap = findComponentDependencies(compilation)
                const outputJson = exportDependencyMap(dependenciesMap)

                compilation.emitAsset(outputRelPath, new sources.RawSource(outputJson))
            })
        })
    }
}
