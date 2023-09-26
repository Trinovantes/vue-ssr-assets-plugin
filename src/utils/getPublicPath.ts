import path from 'node:path'
import { Compilation } from 'webpack'

export function getPublicPath(compilation: Compilation, assetOutputName: string): string {
    const webpackPublicPath = compilation.getAssetPath(compilation.outputOptions.publicPath ?? '/', { hash: compilation.hash })
    let publicPath: string

    if (webpackPublicPath === 'auto') {
        const outputRootDir = compilation.options.output.path ?? './dist'
        const assetDir = path.resolve(outputRootDir, path.dirname(assetOutputName))
        publicPath = path.relative(assetDir, outputRootDir).split(path.sep).join('/')
    } else {
        publicPath = webpackPublicPath
    }

    if (!publicPath.endsWith('/')) {
        publicPath += '/'
    }

    return publicPath
}
