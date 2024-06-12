<template>
  <div id="app" class="container mx-auto p-6">
    <div v-if="!token">
      <AuthComponent @login="handleLogin" />
    </div>
    <div v-else>
      <button @click="logout" class="bg-blue-500 text-white px-4 py-2 rounded mb-3">Logout</button>
      <TimeTracker />
    </div>
  </div>
</template>

<script>
import AuthComponent from './components/AuthComponent.vue';
import TimeTracker from './components/TimeTracker.vue';

export default {
  components: {
    AuthComponent,
    TimeTracker
  },
  data() {
    return {
      token: localStorage.getItem('token') || ''
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
    }
  }
};
</script>

<style scoped>
/* Add your styles here */
</style>
