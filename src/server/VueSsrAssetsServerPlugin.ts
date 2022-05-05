import assert from 'assert'
import { existsSync } from 'fs'
import path from 'path'
import { Compiler, NormalModule, WebpackPluginInstance } from 'webpack'
import { PLUGIN_NAME } from '../Constants'
import { getComponentName } from '../utils/getComponentName'
import { validateServerPluginOptions, VueSsrAssetsServerPluginOptions } from './VueSsrAssetsServerPluginOptions'
import type { VueSsrAssetsServerLoaderOptions } from './VueSsrAssetsServerLoaderOptions'

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

                const componentName = getComponentName(normalModule)
                assert(componentName)

                const options: VueSsrAssetsServerLoaderOptions = {
                    ...this.#options,
                    isScriptSetup,
                    componentName,
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
}
