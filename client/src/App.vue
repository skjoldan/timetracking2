<template>
  <div id="app" class="container mx-auto p-6 relative">
    <div v-if="!token">
      <div class="relative">
        <SalesPitch />
        <div class="absolute top-0 right-0 flex space-x-2">
          <button @click="toggleLogin" class="bg-blue-500 text-white px-4 py-2 rounded">Login</button>
          <button @click="toggleRegister" class="bg-blue-500 text-white px-4 py-2 rounded">Register</button>
        </div>
        <div v-if="showLogin" class="absolute top-12 right-0 bg-white p-6 shadow-lg rounded">
          <AuthComponent @login="handleLogin" :showForm="showLogin" formType="login" />
        </div>
        <div v-if="showRegister" class="absolute top-12 right-0 bg-white p-6 shadow-lg rounded">
          <AuthComponent @login="handleLogin" :showForm="showRegister" formType="register" />
        </div>
      </div>
    </div>
    <div v-else>
      <button @click="logout" class="bg-blue-500 text-white px-4 py-2 rounded mb-3">Logout</button>
      <TimeTracker />
    </div>
  </div>
</template>

<script>
import SalesPitch from './components/SalesPitch.vue';
import AuthComponent from './components/AuthComponent.vue';
import TimeTracker from './components/TimeTracker.vue';

export default {
  components: {
    SalesPitch,
    AuthComponent,
    TimeTracker
  },
  data() {
    return {
      token: localStorage.getItem('token') || '',
      showLogin: false,
      showRegister: false // Initialize showLogin and showRegister to false
    };
  },
  methods: {
    handleLogin(token) {
      this.token = token;
      localStorage.setItem('token', token);
    },
    logout() {
      this.token = '';
      localStorage.removeItem('token');
    },
    toggleLogin() {
      this.showLogin = !this.showLogin;
      this.showRegister = false;
      console.log('Login button clicked, showLogin:', this.showLogin); // Add a log to debug
    },
    toggleRegister() {
      this.showRegister = !this.showRegister;
      this.showLogin = false;
      console.log('Register button clicked, showRegister:', this.showRegister); // Add a log to debug
    }
  }
};
</script>

<style scoped>
/* Add your styles here */
</style>
