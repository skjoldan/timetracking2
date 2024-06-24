import { createApp } from 'vue';
import App from './App.vue';
import './assets/tailwind.css'; // Import Tailwind CSS

console.log("VUE_APP_API_BASE_URL in main.js:", process.env.VUE_APP_API_BASE_URL);


createApp(App).mount('#app');
