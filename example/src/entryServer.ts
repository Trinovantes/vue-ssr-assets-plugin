import express from 'express'
import http from 'http'
import assert from 'assert'
import { VueSsrAssetRenderer } from '../../src'
import { renderToString } from '@vue/server-renderer'
import { createApp } from './app'
import path from 'path'

// -----------------------------------------------------------------------------
// Express
// -----------------------------------------------------------------------------

const app = express()

// -----------------------------------------------------------------------------
// Static Handlers
// Serves webpack generated assets (js/css/img)
// -----------------------------------------------------------------------------

assert(DEFINE.CLIENT_DIST_DIR)
assert(DEFINE.PUBLIC_PATH)
console.info(`Serving ${DEFINE.PUBLIC_PATH} from ${DEFINE.CLIENT_DIST_DIR}`)

app.use('/favicon.ico', express.static(path.join(DEFINE.CLIENT_DIST_DIR, 'favicon.ico')))
app.use(DEFINE.PUBLIC_PATH, express.static(DEFINE.CLIENT_DIST_DIR))

// -----------------------------------------------------------------------------
// HTTP Server
// -----------------------------------------------------------------------------

function createAsyncHandler(handler: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<void>): express.RequestHandler {
    return (req, res, next) => {
        handler(req, res, next).catch(next)
    }
}

function createVueHandler() {
    assert(DEFINE.MANIFEST_FILE)
    const assetRenderer = new VueSsrAssetRenderer(DEFINE.MANIFEST_FILE)

    return createAsyncHandler(async(req, res) => {
        const targetUrl = req.originalUrl
        const ssrContext = {
            url: targetUrl,
            _matchedComponents: new Set<string>(),
        }

        const { app, router } = await createApp(ssrContext)
        if (router.currentRoute.value.fullPath !== targetUrl) {
            res.redirect(router.currentRoute.value.fullPath)
            return
        }

        // Render the app on the server
        const appHtml = await renderToString(app, ssrContext)
        const { header, footer } = assetRenderer.renderAssets(ssrContext._matchedComponents)

        res.setHeader('Content-Type', 'text/html')
        res.status(200)
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                ${header}
            </head>
            <body>
                <div id="app">${appHtml}</div>
                ${footer}
            </body>
            </html>
        `)
    })
}

app.use('*', createVueHandler())

// -----------------------------------------------------------------------------
// HTTP Server
// -----------------------------------------------------------------------------

function runHttpServer() {
    const port = '8080'
    const server = http.createServer(app)

    console.info('Starting HTTP Web Server', `http://localhost:${port}`)

    server.listen(port, () => {
        console.info('Server Listening', port)
    })
}

runHttpServer()
