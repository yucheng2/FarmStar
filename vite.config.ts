import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import uniPlugin from '@dcloudio/vite-plugin-uni'

const uni = typeof uniPlugin === 'function' ? uniPlugin : uniPlugin.default

export default defineConfig(({ mode }) => ({
  plugins: [mode === 'test' ? vue() : uni()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    css: false
  }
}))
