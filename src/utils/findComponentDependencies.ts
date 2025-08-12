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

    // Webpack has a bipartite graph of input files (modules) to output files (chunks)
    // We iterate over each output file and register their respective input files in the manifest
    for (const chunk of compilation.chunks) {
        if (chunk.name && compilation.entries.has(chunk.name)) {
            // Special case when chunk.name is defined (i.e. an entry chunk like 'main.js')
            addChunkAsDependency(chunk.name, chunk)
        } else {
            // Find the module that this chunk is generated from and add this chunk as its dependent
            for (const module of compilation.chunkGraph.getChunkModules(chunk)) {
                // Ignore non Vue component files
                const vueComponentFileName = getComponentName(module)
                if (!vueComponentFileName) {
                    continue
                }

                // Ignore components that results in multiple chunk files
                //
                // e.g.
                //
                //      If `SharedComponent.vue` is used by `PageA.vue` and `PageB.vue` and is small enough to be embeded in both files (depends on webpack's optimization settings),
                //      then we want to avoid registering `PageA.js` and `PageB.js` to `SharedComponent.vue` by skipping `SharedComponent.vue` altogether
                //
                //      This also should not result in a FOUC since `PageA.js` or `PageB.js` should already contain `SharedComponent.vue`'s data
                //
                const moduleChunks = compilation.chunkGraph.getModuleChunks(module)
                if (moduleChunks.length !== 1) {
                    continue
                }

                addChunkAsDependency(vueComponentFileName, chunk)
            }
        }
    }

    return dependencyMap
}
