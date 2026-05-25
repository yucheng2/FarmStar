import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// Custom plugin to transform uni-app custom elements to native HTML
function uniAppTransform() {
  return {
    name: 'uni-app-transform',
    transform(code: string, id: string) {
      if (!id.endsWith('.vue') && !id.endsWith('.html')) return code

      // Only transform template sections in .vue files
      if (id.endsWith('.vue')) {
        // Replace <view with <div, </view> with </div>
        // Replace <image with <img (self-closing or with content)
        // Replace <text with <span, </text> with </span>
        // Replace <scroll-view with <div class="overflow-auto"
        
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
  plugins: [tailwindcss(), vue(), uniAppTransform()],
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
