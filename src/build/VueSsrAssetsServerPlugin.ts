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

    /**
     * Set up loader to insert CHUNK_ID_PLACEHOLDER into each Vue component's render/setup function
     *
     * For options and normal composition (just special case of options)
     *      We need to rewrite ssrRender function
     *
     * For script setup
     *      We need to modify the auto generated setup() function instead since vue-loader bypasses webpack's loader chain
     *      and directly compiles the original <template>
     */
    #setupLoader(compiler: Compiler) {
        compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
            NormalModule.getCompilationHooks(compilation).beforeLoaders.tap(PLUGIN_NAME, (loaderItems, normalModule) => {
                const request = normalModule.request

                // e.g. esbuild-loader!/App.vue?vue&type=script&setup=true
                const isScriptSetup = /\.vue\?vue&type=script/.test(request) && /setup=true/.test(request)

                // e.g. esbuild-loader!/App.vue?vue&type=template
                const isTemplate = /\.vue\?vue&type=template/.test(request) && !isScriptSetup

                if (!isScriptSetup && !isTemplate) {
                    return
                }

                const loaderPath = path.join(__dirname, '../loader')
                const loaderExt = existsSync(`${loaderPath}.ts`) ? 'ts' : 'js'
                const loader = `${loaderPath}.${loaderExt}`

                // Only use loader once per module
                if (loaderItems.find((loaderItem) => loaderItem.loader === loader)) {
                    return
                }

                const insertLoaderIdx = isScriptSetup
                    ? loaderItems.findIndex((loaderItem) => loaderItem.loader.includes('vue-loader/dist/index.js')) + 1 // Inject into <script> before it gets processed by vue-loader
                    : loaderItems.findIndex((loaderItem) => loaderItem.loader.includes('vue-loader/dist/templateLoader.js')) // Inject into ssrRender after <template> is processed by vue-loader

                loaderItems.splice(insertLoaderIdx, 0, {
                    loader,
                    options: {
                        ...this.#options,
                        isScriptSetup,
                    },
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
