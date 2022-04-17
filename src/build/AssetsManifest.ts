export interface AssetsManifest {
    [componentName: string]: {
        js?: Array<string>
        css?: Array<string>
    }
}
