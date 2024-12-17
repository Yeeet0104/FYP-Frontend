<template>
  <div class="login-container">
    <h1 class="text-center">Login</h1>
    <form @submit.prevent="handleLogin" @click="console.log('form clicked')">
      <div class="mb-3">
        <label for="email" class="font-bold">Email:</label>
        <input
          type="text"
          id="email"
          v-model="email"
          placeholder="Enter your username"
          required
          class="border-2 border-gray-300 p-1 w-full"
        />
      </div>

      <div class="form-group">
        <label for="password" class="font-bold">Password:</label>
        <input
          type="password"
          id="password"
          v-model="password"
          placeholder="Enter your password"
          required
          class="border-2 border-gray-300 p-1 w-full"
        />
      </div>

      <button type="submit" class="w-full p-2 bg-blue-500 text-white mt-5">Login</button>
    </form>
    <p v-if="errorMessage" class="text-red-500 mt-5 text-center">{{ errorMessage }}</p>

    <!-- Logout Button -->
    <button
      v-if="isLoggedIn"
      @click="handleLogout"
      class="w-full p-2 bg-red-500 text-white mt-5"
    >
      Logout
    </button>
  </div>
</template>

<script>
import axios from "axios";
import Cookies from "js-cookie";  // Import js-cookie

export default {
  data() {
    return {
      email: "",
      password: "",
      errorMessage: "",
      isLoggedIn: Cookies.get("isLoggedIn") === "true", // Check if logged in from cookies
    };
  },
  methods: {
    async handleLogin() {
      console.log("Form submitted");
      try {
       
        const config = {
          method: "post",
          url: "http://localhost:3000/login",
          data: {
            email: this.email,
            password: this.password,
          },
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        };
        const response = await axios(config);

        if (response.data.success) {
          this.isLoggedIn = true;
          Cookies.set("isLoggedIn", "true"); // Set the login state cookie
          alert("Login successful!");
          
          const userId = response.data.userId;
          Cookies.set("userId", userId); // Set the userId cookie
        }
      } catch (error) {
        console.log("Error details:", {
          message: error.message,
          response: error.response,
          request: error.request,
        });
        if (error.response && error.response.data && error.response.data.message) {
          this.errorMessage = error.response.data.message;
        } else {
          this.errorMessage = "Login failed. Please try again.";
        }
      }
    },
    async handleLogout() {
      try {
        await axios.post("http://localhost:3000/logout", {}, { withCredentials: true });
        this.isLoggedIn = false;
        Cookies.remove("isLoggedIn");  // Remove the login state cookie
        Cookies.remove("userId");  // Optionally remove user ID cookie
        alert("Logout successful!");
      } catch (error) {
        console.error("Logout failed:", error);
      }
    },
  },
};
</script>

<style>
.login-container {
  width: 300px;
  margin: 100px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
}
</style>
