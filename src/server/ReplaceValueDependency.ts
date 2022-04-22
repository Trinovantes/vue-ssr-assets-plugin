import { Dependency, javascript, Generator, sources } from 'webpack'

type DependencyTemplate = ReturnType<Parameters<Generator['generate']>[1]['dependencyTemplates']['get']>
type Expression = Parameters<javascript.JavascriptParser['evaluateExpression']>[0]

export class ReplaceValueDependency extends Dependency {
    #exprNode: Expression
    #replacement: string

    constructor(exprNode: Expression, replacement: string) {
        super()
        this.#exprNode = exprNode
        this.#replacement = replacement
    }

    static Template = class implements DependencyTemplate {
        apply(dependency: ReplaceValueDependency, source: sources.ReplaceSource): void {
            if (!dependency.#exprNode.range) {
                return
            }

            const start = dependency.#exprNode.range[0]
            const end = dependency.#exprNode.range[1] - 1

            source.replace(start, end, JSON.stringify(dependency.#replacement))
        }
    }
}
