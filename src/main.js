import { createApp } from 'vue'
import App from './App.vue'
import router from './router/router'
import 'tailwindcss/tailwind.css';
import CircleProgress from 'vue3-circle-progress';


const app = createApp(App);
app.component('circle-progress', CircleProgress); 
app.use(router);
app.mount('#app');