import { Dependency, javascript, Generator, sources } from 'webpack'

type DependencyTemplate = ReturnType<Parameters<Generator['generate']>[1]['dependencyTemplates']['get']>
type Expression = Parameters<javascript.JavascriptParser['evaluateExpression']>[0]

export class ChunkIdValueDependency extends Dependency {
    #exprNode: Expression
    #chunkId: string

    constructor(exprNode: Expression, chunkId: string) {
        super()
        this.#exprNode = exprNode
        this.#chunkId = chunkId
    }

    static Template = class implements DependencyTemplate {
        apply(dependency: ChunkIdValueDependency, source: sources.ReplaceSource): void {
            if (!dependency.#exprNode.range) {
                return
            }

            const start = dependency.#exprNode.range[0]
            const end = dependency.#exprNode.range[1] - 1

            source.replace(start, end, JSON.stringify(dependency.#chunkId))
        }
    }
}
