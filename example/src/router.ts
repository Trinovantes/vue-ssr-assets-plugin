import { createMemoryHistory, createRouter, createWebHistory, type Router } from 'vue-router'
import type { AppContext } from './AppContext'

// ----------------------------------------------------------------------------
// Router
// ----------------------------------------------------------------------------

export async function createAppRouter(ssrContext?: AppContext): Promise<Router> {
    const router = createRouter({
        history: ssrContext !== undefined
            ? createMemoryHistory()
            : createWebHistory(),

        routes: [
            {
                path: '/',
                component: () => import('./components/HomePage.vue'),
            },
            {
                path: '/a',
                component: () => import('./components/VueComposition.vue'),
            },
            {
                path: '/b',
                component: () => import('./components/VueCompositionSetup.vue'),
            },
            {
                path: '/c',
                component: () => import('./components/VueOptions.vue'),
            },
        ],
    })

    if (ssrContext?.url) {
        await router.push(ssrContext.url)
    }

    return router
}
