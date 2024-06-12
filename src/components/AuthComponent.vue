<template>
  <div class="max-w-md mx-auto">
    <div v-if="!token">
      <h2 class="text-xl font-bold mb-4">Register</h2>
      <form @submit.prevent="register" class="mb-4">
        <div class="mb-3">
          <input v-model="registerUsername" class="form-input w-full border rounded px-4 py-2" placeholder="Username" />
        </div>
        <div class="mb-3">
          <input v-model="registerPassword" type="password" class="form-input w-full border rounded px-4 py-2" placeholder="Password" />
        </div>
        <button type="submit" class="bg-green-500 text-white px-4 py-2 rounded w-full">Register</button>
      </form>

      <h2 class="text-xl font-bold mb-4">Login</h2>
      <form @submit.prevent="login">
        <div class="mb-3">
          <input v-model="username" class="form-input w-full border rounded px-4 py-2" placeholder="Username" />
        </div>
        <div class="mb-3">
          <input v-model="password" type="password" class="form-input w-full border rounded px-4 py-2" placeholder="Password" />
        </div>
        <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded w-full">Login</button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AuthComponent',
  data() {
    return {
      registerUsername: '',
      registerPassword: '',
      username: '',
      password: '',
      token: localStorage.getItem('token') || ''
    };
  },
  methods: {
    async register() {
      try {
        const response = await axios.post('http://localhost:3000/register', {
          username: this.registerUsername,
          password: this.registerPassword
        });
        alert(response.data.message);
      } catch (error) {
        console.error('Registration failed:', error);
      }
    },
    async login() {
      try {
        const response = await axios.post('http://localhost:3000/login', {
          username: this.username,
          password: this.password
        });
        this.token = response.data.token;
        this.$emit('login', this.token);  // Emit login event with token
      } catch (error) {
        console.error('Login failed:', error);
      }
    }
  }
};
</script>

<style scoped>
/* Add your styles here */
</style>
