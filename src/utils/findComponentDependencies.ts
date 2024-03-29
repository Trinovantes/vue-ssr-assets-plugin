import { getComponentName } from './getComponentName'
import { getPublicPath } from './getPublicPath'
import { Chunk, Compilation } from 'webpack'

export type ComponentDependencyMap = Map<string, Set<string>>

export function findComponentDependencies(compilation: Compilation): ComponentDependencyMap {
    const dependencyMap: ComponentDependencyMap = new Map()
    const addChunkAsDependency = (moduleName: string, chunk: Chunk) => {
        let dependencies = dependencyMap.get(moduleName)
        if (!dependencies) {
            dependencies = new Set()
            dependencyMap.set(moduleName, dependencies)
        }

        for (const file of chunk.files) {
            const publicPath = getPublicPath(compilation, file)
            dependencies.add(publicPath + file)
        }

        for (const file of chunk.auxiliaryFiles) {
            const publicPath = getPublicPath(compilation, file)
            dependencies.add(publicPath + file)
        }
    }

    for (const chunk of compilation.chunks) {
        if (chunk.name && compilation.entries.has(chunk.name)) {
            // Special case when chunk.name is defined (this is an entry chunk)
            addChunkAsDependency(chunk.name, chunk)
        } else {
            // Find all modules that this chunk is generated from and add this chunk as their dependencies
            for (const module of compilation.chunkGraph.getChunkModules(chunk)) {
                const componentFileName = getComponentName(module)
                if (!componentFileName) {
                    continue
                }

                addChunkAsDependency(componentFileName, chunk)
            }
        }
    }

    return dependencyMap
}
