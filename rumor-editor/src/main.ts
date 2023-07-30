import { createApp } from 'vue';
import { createPinia } from 'pinia'

import App from './App.vue';
import router from './router';
import icons from './icons';

import './rumor.css';
import 'vue-material-design-icons/styles.css';

const pinia = createPinia();

const app = createApp(App as any)
  .use(pinia)
  .use(router)
  .use(icons)
  .mount("#app")

