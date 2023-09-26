import { Module } from 'webpack'

export function getComponentName(module: Module): string | undefined {
    const moduleImport = module.identifier() // e.g. esbuild-loader!/App.vue?vue&type=script&lang=ts
    const matches = /([\w-]+\.vue)/.exec(moduleImport)
    if (!matches) {
        return
    }

    return matches[1] // e.g. App.vue
}
