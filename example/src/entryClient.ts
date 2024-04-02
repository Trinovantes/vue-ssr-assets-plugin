import { createVueApp } from './createVueApp'

async function main() {
    const { app } = await createVueApp()
    app.mount('#app')
}

main().catch((err: unknown) => {
    console.warn(err)
})
