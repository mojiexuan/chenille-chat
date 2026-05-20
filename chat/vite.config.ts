import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // ! 去除日志，开发时可注释掉，构建打包时一定要打开注释
  build: {
    rolldownOptions: {
      output: {
        minify: {
          compress: {
            dropConsole: true,
            dropDebugger: true,
          },
        },
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // 提取 pnpm 格式的包名（.pnpm/包名@版本/node_modules/包名）
            const match = id.match(/node_modules\/\.pnpm\/([^@/]+)/)
            if (match) return `vendor-${match[1]}`
            // 兜底：常规 node_modules/包名
            const segments = id.split('node_modules/')
            const name = segments.pop()?.split('/')[0]
            if (name) return `vendor-${name}`
          }
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        // 注释
        // target: 'http://127.0.0.1:33003/',
        changeOrigin: true,
      },
    },
  },
})
