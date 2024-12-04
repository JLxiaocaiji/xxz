import App from './App.vue'
import pinia from './store'

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  app.use(pinia)
  return {
    app,
  }
}
// #endif
