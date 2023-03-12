import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { store, storeKey } from './store/index';

import './rumor.css';
import 'vue-material-design-icons/styles.css';

// Vue.config.productionTip = false;

const app = createApp(App as any)
  .use(store, storeKey)
  .use(router)
  .mount("#app")

