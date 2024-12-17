import { createApp } from 'vue'
import App from './App.vue'
import router from './router/router'
import 'tailwindcss/tailwind.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import CircleProgress from 'vue3-circle-progress';

const app = createApp(App);
app.mount('#app');
app.use(Toast);
app.use(router);
app.component('circle-progress', CircleProgress); 
app.mount('#app');

