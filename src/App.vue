<template>
  <div class="flex">
    <!-- Sidebar -->
    <Sidebar @menu-clicked="handleMenuSelection" />

    <!-- Main Content -->
    <div class="flex-grow p-6">
      <div v-if="selectedMenu === 'Learn'">
        <!-- later replace with your component -->
        <h1 class="text-2xl font-bold">Learn Content</h1>
        <p>This is the Learn page.</p>
      </div>
      <div v-else-if="selectedMenu === 'Practice Test'">
                <!-- later replace with your component -->
        <h1 class="text-2xl font-bold">Practice Test Content</h1>
        <p>This is the Practice Test page.</p>
      </div>
      <div v-else-if="selectedMenu === 'Speaking'">
                <!-- later replace with your component -->
        <h1 class="text-2xl font-bold">Speaking Content</h1>
        <p>Practice your speaking skills here.</p>
      </div>
      <div v-else-if="selectedMenu === 'Mock Interview'">
        <h1 class="text-2xl font-bold">Mock Interview Content</h1>
        <p>Prepare for interviews with this practice tool.</p>
      </div>
      <div v-else-if="selectedMenu === 'Question Generation'">
        <QuestionGeneration />
      </div>
      <div v-else-if="selectedMenu === 'Login'">
        <LoginPage />
      </div>
      <div v-else>
        <h1 class="text-2xl font-bold">Welcome to studyhub</h1>
      </div>
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
