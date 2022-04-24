import { CHUNK_ID_PLACEHOLDER, PLUGIN_NAME } from '../Constants'
import { getComponentName } from '../utils/getComponentName'
import path from 'path'
import { Compiler, javascript, NormalModule, WebpackPluginInstance } from 'webpack'
import { ReplaceValueDependency } from './ReplaceValueDependency'
import { validateServerPluginOptions, VueSsrAssetsServerPluginOptions } from './VueSsrAssetsServerPluginOptions'
import { existsSync } from 'fs'
import type { VueSsrAssetsServerLoaderOptions } from './VueSsrAssetsServerLoaderOptions'
import assert from 'assert'

export class VueSsrAssetsServerPlugin implements WebpackPluginInstance {
    #options: Required<VueSsrAssetsServerPluginOptions>

    constructor(options: VueSsrAssetsServerPluginOptions = {}) {
        assert(validateServerPluginOptions(options))
        this.#options = options
    }

    apply(compiler: Compiler) {
        if (compiler.options.target !== 'node') {
            throw new Error('VueSsrAssetsServerPlugin should only be used for server bundles (target:"node")')
        }

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

                if (isScriptSetup && compiler.options.mode === 'development') {
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
                    ? loaderItems.findIndex((loaderItem) => loaderItem.loader.includes('vue-loader/dist/index.js')) // Inject into <script> after it gets processed by vue-loader
                    : loaderItems.findIndex((loaderItem) => loaderItem.loader.includes('vue-loader/dist/templateLoader.js')) // Inject into ssrRender after <template> is processed by vue-loader

                const options: VueSsrAssetsServerLoaderOptions = {
                    ...this.#options,
                    isScriptSetup,
                    componentName: getComponentName(normalModule) ?? '',
                }

                loaderItems.splice(insertLoaderIdx, 0, {
                    loader,
                    options,
                    ident: null,
                    type: null,
                })
            })
        })
    }

    // Set up hooks to replace CHUNK_ID_PLACEHOLDER added in previous step
    #setupPlaceholderReplacer(compiler: Compiler) {
        compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
            compilation.dependencyTemplates.set(ReplaceValueDependency, new ReplaceValueDependency.Template())
        })

        compiler.hooks.normalModuleFactory.tap(PLUGIN_NAME, (normalModuleFactory) => {
            const onParserCreated = (parser: javascript.JavascriptParser) => {
                parser.hooks.expression.for(CHUNK_ID_PLACEHOLDER).tap(PLUGIN_NAME, (expr) => {
                    const componentFileName = getComponentName(parser.state.module)
                    if (!componentFileName) {
                        return
                    }

                    parser.state.module.addDependency(new ReplaceValueDependency(expr, componentFileName))
                })
            }

            normalModuleFactory.hooks.parser.for('javascript/auto').tap(PLUGIN_NAME, onParserCreated)
            normalModuleFactory.hooks.parser.for('javascript/dynamic').tap(PLUGIN_NAME, onParserCreated)
            normalModuleFactory.hooks.parser.for('javascript/esm').tap(PLUGIN_NAME, onParserCreated)
        })
    }
}
