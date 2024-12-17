<template>
  <div class="bg-gray-900 text-white w-64 h-screen flex flex-col">
    <!-- Sidebar Header -->
    <div class="flex items-center justify-center p-4 border-b border-gray-700">
      <div class="flex items-center">
        <img src="-" alt="Avatar" class="w-10 h-10 rounded-full" />
        <div class="ml-3">
          <h1 class="text-lg font-bold">Study<span class="text-purple-500">Hub</span></h1>
        </div>
      </div>
    </div>

    <!-- Menu Items -->
    <nav class="flex-grow mt-4">
      <ul class="space-y-2">
        <li
          v-for="item in menuItems"
          :key="item.name"
          class="group relative"
        >
          <!-- Main menu item -->
          <div
            class="flex items-center p-3 hover:bg-gray-700 cursor-pointer"
            @click="handleMenuClick(item)"
                          @click.stop="toggleDropdown(item)"
          >
            <span :class="item.icon" class="w-6 h-6 text-gray-400"></span>
            <span class="ml-3">{{ item.name }}</span>
            <!-- Dropdown indicator -->
            <span
              v-if="item.children"
              class="ml-auto transition-transform"
              :class="{ 'rotate-90': item.isOpen }"
            >
              ▶
            </span>
          </div>

          <!-- Dropdown Items -->
          <ul
            v-if="item.isOpen && item.children"
            class="space-y-2 bg-gray-800 pl-14"
          >
            <li
              v-for="child in item.children"
              :key="child.name"
              class="p-2 hover:bg-gray-700 cursor-pointer"
              @click="handleMenuClick(child)"
            >
              {{ child.name }}
            </li>
          </ul>
        </li>
      </ul>
    </nav>

    <!-- Footer -->
    <div class="mt-auto border-t border-gray-700 p-4">
      <div class="flex items-center">
        <img src="-" alt="User Avatar" class="w-10 h-10 rounded-full" />
        <div class="ml-3">
          <p class="text-sm font-bold">Bharat</p>
          <p class="text-xs text-gray-400">More</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      menuItems: [
        { name: "Learn", icon: "icon-class-for-learn" },
        { name: "Practice Test", icon: "icon-class-for-practice" },
        {
          name: "Practice English",
          icon: "icon-class-for-challenge",
          isOpen: false,
          children: [
            { name: "Speaking" },
            { name: "Mock Interview" },
          ],
        },
        { name: "Question Generation", icon: "icon-class-for-question" },
        { name: "Login", icon: "icon-class-for-login" },
      ],
    };
  },
  methods: {
    toggleDropdown(item) {
      // Toggle dropdown visibility
      if (item.children) {
        item.isOpen = !item.isOpen;
      }
    },
    handleMenuClick(item) {
      // Emit event to parent with selected item
      this.$emit("menu-clicked", item.name);
    },
  },
};
</script>
