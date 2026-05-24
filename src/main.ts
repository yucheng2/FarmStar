import App from './App.vue'
import { createSSRApp } from 'vue'
import './styles/index.css'

export function createApp() {
  const app = createSSRApp(App)

  return {
    app
  }
}
