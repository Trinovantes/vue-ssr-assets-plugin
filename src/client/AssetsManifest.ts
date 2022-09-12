export type AssetsManifest = {
    [componentName: string]: {
        js?: Array<string>
        css?: Array<string>
    }
}
