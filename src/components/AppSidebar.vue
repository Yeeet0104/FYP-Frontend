<template>
  <div class="bg-gray-900 text-white w-64 min-h-screen flex flex-col">
    <!-- Sidebar Toggle Button for Mobile -->
    <!-- <button @click="isSidebarOpen = !isSidebarOpen" class="fixed top-4 left-4 z-50 bg-gray-900 text-white p-2 rounded">
      ☰
    </button> -->

    <!-- Sidebar -->
    <div :class="{ hidden: !isSidebarOpen }" class="bg-gray-900 text-white w-64 h-full flex flex-col">
      <!-- Sidebar Header -->
      <div class="flex p-4 border-b border-gray-700">
        <div class="flex items-center w-full">
          <div>
            <img :src="icon" alt="Avatar" class="w-10 h-10 rounded-full" />

          </div>
          <div class="ml-3">
            <h1 class="text-lg font-bold">Study<span class="text-purple-500">Hub</span></h1>
          </div>
        </div>
      </div>

      <!-- Menu Items -->
      <nav class="flex-grow overflow-y-auto mt-4">
        <ul class="space-y-2">
          <li v-for="item in menuItems" :key="item.name" class="group relative">
            <!-- Main menu item -->
            <div class="flex items-center p-3 hover:bg-gray-700 cursor-pointer"
              @click="handleDropdownOrNavigation(item)">
              <span :class="`fas fa-${item.icon}`" class="w-6 h-6 text-gray-400"></span>
              <span class="ml-3">{{ item.name }}</span>
              <!-- Dropdown indicator -->
              <span v-if="item.children" class="ml-auto transition-transform" :class="{ 'rotate-90': item.isOpen }">
                ▶
              </span>
            </div>

            <!-- Dropdown Items -->
            <ul v-if="item.isOpen && item.children" class="space-y-2 bg-gray-800 pl-14">
              <li v-for="child in item.children" :key="child.name" class="p-2 hover:bg-gray-700 cursor-pointer"
                @click="handleMenuClick(child)">
                {{ child.name }}
              </li>
            </ul>
          </li>
        </ul>
      </nav>

      <!-- Footer -->
      <div class="border-t border-gray-700 p-4">
        <div class="flex items-center">
          <img :src="profilePictureUrl" alt="Profile Picture" class="w-10 h-10 rounded-full object-cover" />
          <div class="ml-3">
            <p class="text-sm text-white font-bold">{{ username }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import axios from 'axios';
import icon from "@/assets/icon.webp";
export default {
  data() {
    return {
      icon,
      profilePictureUrl: '',
      username: '',
      isSidebarOpen: true,
      menuItems: [
        { name: "User Profile", icon: "user" },
        { name: "Notes", icon: "book" },
        { name: "Practice Test", icon: "pencil-alt" },
        {
          name: "Practice English",
          icon: "language",
          isOpen: false,
          children: [
            { name: "Speaking" },
            { name: "Mock Interview" },
          ],
        },
      ],
    };
  },
  methods: {
    toggleDropdown(item) {
      if (item.children) {
        item.isOpen = !item.isOpen;
      }
    },
    handleMenuClick(item) {
      const route = item.name.toLowerCase().replace(" ", "-");
      this.$router.push(`/${route}`);
    },
    handleDropdownOrNavigation(item) {
      if (item.children) {
        this.toggleDropdown(item);
      } else {
        this.handleMenuClick(item);
      }
    },
    async fetchUser() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("Token is missing.");
          return;
        }

        const response = await axios.get(
          "http://localhost:3000/fetch-user",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const userData = response.data.userData;
        this.username = userData.username;
        this.profilePictureUrl = userData.profilePictureUrl || '';
      } catch (error) {
        console.error("Error fetching user data:", error.response ? error.response.data : error.message);
      }
    }
  },
  created() {
    this.fetchUser();
  },
};
</script>