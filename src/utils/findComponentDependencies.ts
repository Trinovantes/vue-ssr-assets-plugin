import path from 'path'
import type { Compilation } from 'webpack'
import { getComponentName } from './getComponentName'
import { getPublicPath } from './getPublicPath'

export type ComponentDependencyMap = Map<string, Set<string>>

export function findComponentDependencies(compilation: Compilation): ComponentDependencyMap {
    const componentDependencyMap: ComponentDependencyMap = new Map()

    for (const chunk of compilation.chunks) {
        for (const module of compilation.chunkGraph.getChunkModules(chunk)) {
            const componentFileName = getComponentName(module)
            if (!componentFileName) {
                continue
            }

            let componentFileNames = componentDependencyMap.get(componentFileName)
            if (!componentFileNames) {
                componentFileNames = new Set()
                componentDependencyMap.set(componentFileName, componentFileNames)
            }

            for (const file of chunk.files) {
                const publicPath = getPublicPath(compilation, file)
                componentFileNames.add(path.join(publicPath, file))
            }
        }
    }

    return componentDependencyMap
}
