<template>
  <div class="max-w-md mx-auto mt-4">
    <div v-if="formType === 'register'">
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
    </div>
    <div v-else-if="formType === 'login'">
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
import axios from '../axios-config';

export default {
  name: 'AuthComponent',
  props: {
    showForm: {
      type: Boolean,
      default: false
    },
    formType: {
      type: String,
      default: 'login'
    }
  },
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
        console.log('Registering user:', this.registerUsername);
        const response = await axios.post('/api/register', {
          username: this.registerUsername,
          password: this.registerPassword
        });
        console.log('Register response:', response.data);
        alert(response.data.message);
        this.$emit('toggleRegister'); // Hide the registration form after successful registration
      } catch (error) {
        console.error('Registration failed:', error);
      }
    },
    async login() {
      try {
        console.log('Logging in user:', this.username);
        const response = await axios.post('/api/login', {
          username: this.username,
          password: this.password
        });
        console.log('Login response:', response.data);
        this.token = response.data.token;
        localStorage.setItem('token', this.token);  // Store the token
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
