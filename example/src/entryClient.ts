import { createApp } from './app'

async function main() {
    const { app } = await createApp()
    app.mount('#app')
}

main().catch((err) => {
    console.warn(err)
})
