import { readFileSync } from 'fs'
import type { AssetsManifest } from '../build/AssetsManifest'

export class VueSsrAssetRenderer {
    #manifest: AssetsManifest
    #rootComponentName: string

    constructor(manifestPath: string, rootComponentName = 'App.vue') {
        this.#manifest = JSON.parse(readFileSync(manifestPath).toString('utf-8')) as AssetsManifest
        this.#rootComponentName = rootComponentName
    }

    get manifest(): Readonly<AssetsManifest> {
        return this.#manifest
    }

    renderAssets(matchedComponents: Iterable<string>): { header: string; footer: string } {
        const components = [
            this.#rootComponentName,
            ...matchedComponents,
        ]

        console.info('manifest', this.#manifest)
        console.info('components', components)

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
            header += `<link rel="preload" href="${js}" as="script">\n`
            footer += `<script src="${js}" defer></script>\n`
        }

        return {
            header,
            footer,
        }
    }
}
