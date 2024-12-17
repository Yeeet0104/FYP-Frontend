import { createApp } from 'vue'
import App from './App.vue'
import 'tailwindcss/tailwind.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

const app = createApp(App);
app.mount('#app');
app.use(Toast);