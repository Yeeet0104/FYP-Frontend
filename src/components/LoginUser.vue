<template>
    <div class="flex justify-center items-center h-screen bg-gray-100">
        <div class="bg-white p-8 rounded shadow-md w-96">
            <h2 class="text-2xl font-bold text-center mb-4">Login</h2>
            <form @submit.prevent="login">
                <div class="mb-4">
                    <label class="block font-medium mb-1" for="username">Username</label>
                    <input v-model="username" id="username" type="text"
                        class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Enter your username or email" />
                </div>
                <div class="mb-6">
                    <label class="block font-medium mb-1" for="password">Password</label>
                    <input v-model="password" id="password" type="password"
                        class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Enter your password" />
                </div>
                <button type="submit" class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition">
                    Login
                </button>
            </form>
            <p class="text-center mt-4">
                Don't have an account?
                <router-link to="/register" class="text-blue-500 hover:underline">
                    Register
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
            password: '',
        };
    },
    methods: {
        async login() {
            try {
                if (!this.username || !this.password) {
                    alert("Username and password are required.");
                    return;
                }
                const response = await fetch('http://localhost:3000/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: this.username, password: this.password }),
                });
                const data = await response.json();
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    this.$router.push('/mock-interview');
                } else {
                    alert('Invalid credentials');
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('Something went wrong. Please try again.');
            }
        },
    },
};
</script>