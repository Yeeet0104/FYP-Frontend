<template>
  <div class="flex max-h-screen min-h-screen">
    <!-- Sidebar -->
    <Sidebar v-if="showSidebar" @menu-clicked="handleMenuSelection" />
    <!-- Main Content -->
    <div class="flex-grow p-6 max-h-screen">
      <router-view />
    </div>
  </div>
</template>

<script>
import Sidebar from "./components/AppSidebar.vue";
export default {
  components: {
    Sidebar,
  },
  data() {
    return {
      selectedMenu: null, // Tracks the selected menu or dropdown item
    };
  },
  mounted() {
    // Check if the user is visiting for the first time

    // Redirect to the desired page
    this.$router.push("/notes");



  },
  methods: {
    handleMenuSelection(menuName) {
      // Update selected menu
      this.selectedMenu = menuName;
    },
    handleLoginSuccess() {
      // Navigate to Question Generation after successful login
      this.selectedMenu = 'Question Generation';
    },
  },
  computed: {
    showSidebar() {
      // Hide sidebar if the current route is '/login' or '/register'
      return this.$route.path !== "/login" && this.$route.path !== "/register";
    },
  },
};
</script>
