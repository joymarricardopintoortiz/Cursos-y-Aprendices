import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { Quasar, Notify, Dialog } from 'quasar'
import quasarLang from 'quasar/lang/es'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/dist/quasar.css'
import './style.css'
import App from './App.vue'
import router from './router'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

createApp(App)
  .use(pinia)
  .use(router)
  .use(Quasar, {
    plugins: { Notify, Dialog },
    lang: quasarLang,
    config: { notify: { position: 'top', timeout: 3000 } },
  })
  .mount('#app')