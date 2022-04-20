import { CHUNK_ID_PLACEHOLDER, PLUGIN_NAME } from '../Constants'
import { getComponentName } from '../utils/getComponentName'
import path from 'path'
import { Compiler, javascript, NormalModule, WebpackPluginInstance } from 'webpack'
import { ChunkIdValueDependency } from './ChunkIdValueDependency'
import { validateServerPluginOptions, VueSsrAssetsServerPluginOptions } from './VueSsrAssetsServerPluginOptions'
import { existsSync } from 'fs'

export class VueSsrAssetsServerPlugin implements WebpackPluginInstance {
    #options: VueSsrAssetsServerPluginOptions

    constructor(options: VueSsrAssetsServerPluginOptions = {}) {
        validateServerPluginOptions(options)
        this.#options = options
    }

    apply(compiler: Compiler) {
        this.#setupLoader(compiler)
        this.#setupPlaceholderReplacer(compiler)
    }

    // Set up loader that will insert CHUNK_ID_PLACEHOLDER into vue's render functions
    #setupLoader(compiler: Compiler) {
        const loaderPath = path.join(__dirname, '../loader')
        const loaderExt = existsSync(`${loaderPath}.ts`) ? 'ts' : 'js'
        const loader = `${loaderPath}.${loaderExt}`

        compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
            NormalModule.getCompilationHooks(compilation).beforeLoaders.tap(PLUGIN_NAME, (loaderItems, normalModule) => {
                // Only use loader on <template> modules
                // e.g. esbuild-loader!/App.vue?vue&type=template
                const request = normalModule.request
                if (!/\.vue\?vue&type=template/.test(request)) {
                    return
                }

                // Only use loader once per module
                if (loaderItems.find((loaderItem) => loaderItem.loader === loader)) {
                    return
                }

                // Register this loader right after vue-loader converts <template> into render function
                const vueLoaderIdx = loaderItems.findIndex((loaderItem) => loaderItem.loader.includes('vue-loader/dist/index.js'))

                loaderItems.splice(vueLoaderIdx - 1, 0, {
                    loader,
                    options: this.#options,
                    ident: null,
                    type: null,
                })
            })
        })
    }

    // Set up hooks to replace CHUNK_ID_PLACEHOLDER added in previous step
    #setupPlaceholderReplacer(compiler: Compiler) {
        compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
            compilation.dependencyTemplates.set(ChunkIdValueDependency, new ChunkIdValueDependency.Template())
        })

        compiler.hooks.normalModuleFactory.tap(PLUGIN_NAME, (normalModuleFactory) => {
            const onParserCreated = (parser: javascript.JavascriptParser) => {
                parser.hooks.expression.for(CHUNK_ID_PLACEHOLDER).tap(PLUGIN_NAME, (expr) => {
                    const componentFileName = getComponentName(parser.state.module)
                    if (!componentFileName) {
                        return
                    }

                    parser.state.module.addDependency(new ChunkIdValueDependency(expr, componentFileName))
                })
            }

            normalModuleFactory.hooks.parser.for('javascript/auto').tap(PLUGIN_NAME, onParserCreated)
            normalModuleFactory.hooks.parser.for('javascript/dynamic').tap(PLUGIN_NAME, onParserCreated)
            normalModuleFactory.hooks.parser.for('javascript/esm').tap(PLUGIN_NAME, onParserCreated)
        })
    }
}
