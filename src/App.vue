<template>
  <div class="flex">
    <!-- Sidebar -->
    <Sidebar @menu-clicked="handleMenuSelection" />

    <!-- Main Content -->
    <div class="flex-grow p-6">
      <router-view />
    </div>
  </div>
</template>

<script>
import Sidebar from "./components/AppSidebar.vue";
import QuestionGeneration from "./components/questionGeneration.vue";
import LoginPage from "./components/loginPage.vue";
export default {
  components: {
    Sidebar,
    QuestionGeneration,
    LoginPage
  },
  data() {
    return {
      selectedMenu: null, // Tracks the selected menu or dropdown item
    };
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
};
</script>
