import { readFileSync } from 'node:fs'
import { AssetsManifest } from '../client/AssetsManifest'

export class VueSsrAssetRenderer {
    #manifest: AssetsManifest
    #entry: string

    /**
     * Helper class for combining matchedComponents with generated manifest
     *
     * @param manifestPath Path to manifest file generated by `VueSsrAssetClientPlugin`
     * @param entry Name of webpack.config.entry
     */
    constructor(manifestPath: string, entry = 'main') {
        this.#manifest = JSON.parse(readFileSync(manifestPath).toString('utf-8')) as AssetsManifest
        this.#entry = entry
    }

    get manifest(): Readonly<AssetsManifest> {
        return this.#manifest
    }

    renderAssets(matchedComponents: Iterable<string>, renderScriptPreloads = true): { header: string; footer: string } {
        const components = [
            this.#entry,
            ...matchedComponents,
        ]

        const allJs = new Set<string>()
        const allCss = new Set<string>()

        for (const componentName of components) {
            for (const dep of this.#manifest[componentName]?.js ?? []) {
                allJs.add(dep)
            }
            for (const dep of this.#manifest[componentName]?.css ?? []) {
                allCss.add(dep)
            }
        }

        let header = ''
        let footer = ''

        for (const css of allCss) {
            header += `<link rel="stylesheet" href="${css}">\n`
        }

        for (const js of allJs) {
            if (renderScriptPreloads) {
                header += `<link rel="preload" href="${js}" as="script">\n`
            }

            footer += `<script src="${js}" defer></script>\n`
        }

        return {
            header,
            footer,
        }
    }
}
