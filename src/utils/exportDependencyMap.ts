import type { AssetsManifest } from '../build/AssetsManifest'
import type { ComponentDependencyMap } from './findComponentDependencies'

export function exportDependencyMap(dependencyMap: ComponentDependencyMap) {
    const json: AssetsManifest = {}

    for (const [componentName, dependencies] of dependencyMap.entries()) {
        json[componentName] = {
            js: [...dependencies].filter((fileName) => fileName.endsWith('.js')),
            css: [...dependencies].filter((fileName) => fileName.endsWith('.css')),
        }
    }

    return JSON.stringify(json)
}
