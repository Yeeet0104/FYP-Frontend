<template>
  <div class="flex justify-center items-center h-screen bg-gray-100">
    <div class="bg-white p-8 rounded shadow-md w-96">
      <h2 class="text-2xl font-bold text-center mb-4">Register</h2>
      <form @submit.prevent="register">
        <div class="mb-4">
          <label class="block font-medium mb-1" for="username">Username</label>
          <input v-model="username" id="username" type="text"
            class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="Choose a username" />
        </div>
        <div class="mb-4">
          <label class="block font-medium mb-1" for="email">Email</label>
          <input v-model="email" id="email" type="email"
            class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="Enter your email" />
        </div>
        <div class="mb-6">
          <label class="block font-medium mb-1" for="password">Password</label>
          <input v-model="password" id="password" type="password"
            class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="Choose a password" />
        </div>
        <button type="submit" class="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition">
          Register
        </button>
      </form>
      <p class="text-center mt-4">
        Already have an account?
        <router-link to="/login" class="text-green-500 hover:underline">
          Login
        </router-link>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      email: '',
      password: '',
    };
  },
  methods: {
    async register() {
      try {
        const payload = {
          username: this.username,
          email: this.email,
          password: this.password,
        };
        console.log('Registration payload:', payload); // Log the data being sent

        const response = await fetch('http://localhost:3000/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (data.message) {
          alert('Registration successful! You can now log in.');
          this.$router.push('/login');
        } else {
          alert('Registration failed: ' + data.error);
        }
      } catch (error) {
        console.error('Registration error:', error);
        alert('Something went wrong. Please try again.');
      }
    }
  },
};
</script>
