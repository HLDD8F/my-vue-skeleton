import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import i18n from './shared/i18n/i18n';
import './style.css';

const app = createApp(App);
app.use(createPinia());
app.use(i18n);
app.use(router);

app.mount('#app');
