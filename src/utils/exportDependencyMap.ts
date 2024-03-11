import { ComponentDependencyMap } from './findComponentDependencies'
import { AssetsManifest } from '../client/AssetsManifest'

export function exportDependencyMap(dependencyMap: ComponentDependencyMap) {
    const json: AssetsManifest = {}

    for (const [componentName, dependencies] of dependencyMap.entries()) {
        json[componentName] = {
            js: [...dependencies].filter((fileName) => fileName.endsWith('.js')),
            css: [...dependencies].filter((fileName) => fileName.endsWith('.css')),
            fonts: [...dependencies].filter((fileName) => fileName.endsWith('.ttf') || fileName.endsWith('.eot') || fileName.endsWith('.woff') || fileName.endsWith('.woff2')),
        }
    }

    return JSON.stringify(json)
}
