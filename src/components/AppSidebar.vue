<template>
  <div class="bg-gray-900 text-white w-64 h-screen flex flex-col">
    <!-- Sidebar Header -->
    <div class="flex items-center justify-center p-4 border-b border-gray-700">
      <div class="flex items-center">
        <img src="-" alt="Avatar" class="w-10 h-10 rounded-full" />
        <div class="ml-3">
          <h1 class="text-lg font-bold">Mento<span class="text-purple-500">Mind</span></h1>
        </div>
      </div>
    </div>

    <!-- Menu Items -->
    <nav class="flex-grow mt-4">
      <ul class="space-y-2">
        <li v-for="item in menuItems" :key="item.name" class="flex items-center p-3 hover:bg-gray-700 cursor-pointer">
          <span :class="item.icon" class="w-6 h-6 text-gray-400"></span>
          <span class="ml-3">{{ item.name }}</span>
        </li>
      </ul>
    </nav>

    <!-- Special Section
    <div class="p-4">
      <div class="bg-gray-800 rounded-lg p-3">
        <div class="flex items-center">
          <span class="bg-purple-500 text-white p-2 rounded-full">🎓</span>
          <span class="ml-3 text-sm">Classes</span>
        </div>
        <div class="mt-2 bg-gray-700 p-2 rounded">
          <div class="flex items-center">
            <span class="bg-purple-500 text-white p-2 rounded-full">🤖</span>
            <span class="ml-3 text-sm">Mento AI Hub</span>
          </div>
        </div>
      </div>
    </div> -->

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
        { name: "Challenge", icon: "icon-class-for-challenge" },
        { name: "Actions", icon: "icon-class-for-actions" },
      ],
    };
  },
};
</script>
