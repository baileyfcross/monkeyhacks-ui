import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { getSkinPrices } from './server/skinPriceService'

function createApiMiddleware() {
  return async (req: { method?: string; url?: string }, res: {
    setHeader: (name: string, value: string) => void
    end: (body: string) => void
    statusCode: number
  }, next: () => void) => {
    const requestUrl = req.url ?? ''
    const { pathname } = new URL(requestUrl, 'http://localhost')

    if (req.method !== 'GET' || pathname !== '/api/skins/prices') {
      next()
      return
    }

    const { statusCode, payload } = await getSkinPrices()
    res.statusCode = statusCode
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify(payload))
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    {
      name: 'monkeyhacks-skins-api',
      configureServer(server) {
        server.middlewares.use(createApiMiddleware())
      },
      configurePreviewServer(server) {
        server.middlewares.use(createApiMiddleware())
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
