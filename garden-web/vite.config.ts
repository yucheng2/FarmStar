import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import uniPlugin from '@dcloudio/vite-plugin-uni'
import UnoCSS from '@unocss/vite'

const uni = typeof uniPlugin === 'function' ? uniPlugin : uniPlugin.default

export default defineConfig(({ mode }) => ({
  plugins: [mode === 'test' ? vue() : UnoCSS({ configFile: './uno.config.ts' }), uni()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    css: false,
    exclude: ['node_modules/**', 'dist/**', 'unpackage/**', '.worktrees/**']
  }
}))
