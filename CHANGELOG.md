# Vue SSR Assets Plugin Changelog

This document only contains breaking changes

## 0.3.0

* Mark `vue@^3` and `vue-loader@^17` as peer dependencies

## 0.2.0

* `VueSsrAssetsRenderer` constructor now accepts `webpack.config.entry` instead of root component name. Webpack sometimes do not place the root chunk (with all the initialization JS) with the root component in large applications. This change ensures the root chunk is always resolved.
