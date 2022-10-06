import type { SSRContext } from '@vue/server-renderer'

export type AppContext = SSRContext & {
    url: string
    _matchedComponents: Set<string>
}
