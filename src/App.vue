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

export default {
  components: {
    Sidebar,

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
  },
};
</script>
