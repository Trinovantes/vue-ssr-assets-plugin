# Vue SSR Assets Plugin Changelog

This document only contains breaking changes

## 0.4.0

* `VueSsrAssetRenderer.render()` optional args are moved to separate object instead of additional args to the function

  **Before:**

  ```ts
  const { header, footer } = assetRenderer.renderAssets(ssrContext._matchedComponents, true)
  const { header, footer } = assetRenderer.renderAssets(ssrContext._matchedComponents, true, true)
  const { header, footer } = assetRenderer.renderAssets(ssrContext._matchedComponents, true, true, true)
  ```

  **After:**

  ```ts
  const { header, footer } = assetRenderer.renderAssets(ssrContext._matchedComponents, {
    excludeHotUpdateScripts: true, // Default
    renderScriptPreloads: true, // Default
    renderFontPreloads: true, // Default
  })
  ```

## 0.3.0

* Mark `vue@^3` and `vue-loader@^17` as peer dependencies

## 0.2.0

* `VueSsrAssetsRenderer` constructor now accepts `webpack.config.entry` instead of root component name. Webpack sometimes do not place the root chunk (with all the initialization JS) with the root component in large applications. This change ensures the root chunk is always resolved.
