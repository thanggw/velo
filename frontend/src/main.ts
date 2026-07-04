import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import { permission } from './directives/permission';
import { router } from './router';
import './styles/app.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(ElementPlus, { zIndex: 3000 });
app.directive('permission', permission);

app.mount('#app');
