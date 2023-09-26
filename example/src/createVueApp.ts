import { createSSRApp } from 'vue'
import App from './components/App.vue'
import { createAppRouter } from './router'
import { AppContext } from './AppContext'
import { createRouter } from 'vue-router'

type VueApp = {
    app: ReturnType<typeof createSSRApp>
    router: ReturnType<typeof createRouter>
}

export async function createVueApp(ssrContext?: AppContext): Promise<VueApp> {
    // Vue
    const app = createSSRApp(App)

    // Vue Router
    const router = await createAppRouter(ssrContext)
    app.use(router)
    await router.isReady()

    return {
        app,
        router,
    }
}
