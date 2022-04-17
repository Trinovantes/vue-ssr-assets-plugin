# Vue SSR Assets Plugin

This is a Webpack 5 plugin for Vue 3 SSR applications to generate manifest of critical assets. This package consists of two plugins: one for the client bundle and one for the server bundle similar to how SSR in Vue 2 worked.

Out of the box, Vue 3 SSR loads the entry bundle (e.g. `main.js`) that then asynchronously loads the remaining files needed for the page. However, this results in a poor user experience due to [FOUC](https://en.wikipedia.org/wiki/Flash_of_unstyled_content) and poor web performance scores.

### Before

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="/public/main.64381ac7ca0c0b20aee8.css">
    <link rel="preload" href="/public/main.222b5c717defa040360d.js" as="script">
</head>
<body>
    <div id="app">...</div>
    <script src="/public/main.222b5c717defa040360d.js" defer></script>
</body>
</html>
```

### After

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="/public/main.64381ac7ca0c0b20aee8.css">
    <link rel="preload" href="/public/main.222b5c717defa040360d.js" as="script">
    <link rel="preload" href="/public/762.402cdc4e5ac18e420857.js" as="script"> <!-- New -->
</head>
<body>
    <div id="app">...</div>
    <script src="/public/main.222b5c717defa040360d.js" defer></script>
    <script src="/public/762.402cdc4e5ac18e420857.js" defer></script> <!-- New -->
</body>
</html>
```

## Client Plugin

This generates a JSON manifest that describes the dependent assets of each Vue component.

```ts
import { VueSsrAssetsClientPlugin } from 'vue-ssr-assets-plugin'

const clientEntryConfig = merge(commonConfig, {
    target: 'web',

    entry: {
        main: `${srcDir}/entryClient.ts`,
    },

    plugins: [
        new VueSsrAssetsClientPlugin({
            fileName: 'ssr-manifest.json',
        }),
    ],
})
```

## Server Plugin

This modifies the `ssrRender` function that `vue-loader` automatically generates from your `<template>` tag in your SFC. At runtime, each component will register their webpack chunk name into `ssrContext._matchedComponents: Set<string>()`. Each name will correspond with a key in the manifest generated by the client plugin that you can then lookup the critical assets for the current request.

```ts
import { VueSsrAssetsServerPlugin } from 'vue-ssr-assets-plugin'

const serverEntryConfig = merge(commonConfig, {
    target: 'node',

    entry: {
        www: `${srcDir}/entryServer.ts`,
    },

    output: {
        libraryTarget: 'commonjs2',
    },

    plugins: [
        new VueSsrAssetsServerPlugin(),
    ],
})
```

## Example Usage

```ts
import App from './App.vue'
import { createSSRApp } from 'vue'
import { createRouter } from 'vue-router'
import { renderToString } from '@vue/server-renderer'
import { readFileSync } from 'fs'
import { AssetsManifest, VueSsrAssetRenderer } from 'vue-ssr-assets-plugin'

/**
 * After renderToString(), ssrContext._matchedComponents will contain
 * all the components that this request needs e.g. ['MainLayout.vue', 'HomePage.vue']
 *
 * These can then be matched with the dict in ssr-manifest.json to find all the critical js/css files
 *
 * VueSsrAssetRenderer is a helper class that reads the ssrContext
 * and generates the corresponding <script> and <link> tags
 */
const assetRenderer = new VueSsrAssetRenderer('/path/to/ssr-manifest.json')

async function handleRequest(req, res) {
    const ssrContext = {
        _matchedComponents: new Set<string>(),
    }

    const app = createSSRApp(App)
    const router = createRouter()
    await router.push(req.originalUrl)
    app.use(router)

    const appHtml = await renderToString(app, ssrContext)
    const { header, footer } = assetRenderer.renderAssets(ssrContext._matchedComponents)

    res.setHeader('Content-Type', 'text/html')
    res.status(200)
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            ${header}
        </head>
        <body>
            <div id="app">${appHtml}</div>
            ${footer}
        </body>
        </html>
    `)
}
```

See the [example](https://github.com/Trinovantes/vue-ssr-assets-plugin/tree/master/example) directory for a full example.
