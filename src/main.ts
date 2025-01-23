import { createApp } from 'vue'
import App from './App.vue'
import router from './router';

import { IonicVue } from '@ionic/vue';
import { ThemeService } from './services/ThemeService';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Ionic Dark Theme */
import '@ionic/vue/css/palettes/dark.css';

/* Theme variables */
import './theme/variables.css';

// Initialize theme before mounting the app
ThemeService.initializeTheme();

const app = createApp(App);

app.use(IonicVue, {
  mode: 'ios'
});

app.use(router);

router.isReady().then(() => {
  app.mount('#app');
});
