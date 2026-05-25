import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from '@unocss/vite'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Custom plugin to transform uni-app custom elements to native HTML
function uniAppTransform() {
  return {
    name: 'uni-app-transform',
    transform(code: string, id: string) {
      if (!id.endsWith('.vue') && !id.endsWith('.html')) return code

      if (id.endsWith('.vue')) {
        let result = code
          .replace(/<view([\s>])/g, '<div$1')
          .replace(/<\/view>/g, '</div>')
          .replace(/<image\b([^>]*)(\/?)>/g, '<img$1>')
          .replace(/<\/image>/g, '')
          .replace(/<text([\s>])/g, '<span$1')
          .replace(/<\/text>/g, '</span>')
          .replace(/<scroll-view([\s>])/g, '<div class="overflow-auto"$1')
          .replace(/<\/scroll-view>/g, '</div>')

        return result
      }

      return code
    }
  }
}

export default defineConfig({
  plugins: [uniAppTransform(), vue(), UnoCSS({ configFile: resolve(__dirname, 'uno.config.ts') })],
  server: {
    port: 5174
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    css: false
  }
})
