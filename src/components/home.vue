<template>
    <div class="h-full flex items-center bg-blue-50 p-8 rounded-lg">
        <!-- Left Section: Text Content -->
        <div class="w-1/2">
            <h1 class="text-5xl font-bold text-blue-700 mb-4">Study Hub</h1>
            <p class="text-gray-600 mb-6 text-xl font-semibold text-justify">
                To promote self-learning and academic excellence by providing a comprehensive platform that supports
                students in exam preparation and English language development.
            </p>
            <button @click="goToRoute" class="px-6 py-2 bg-blue-500 text-white rounded shadow-md hover:bg-blue-600 transition">
                Start
            </button>
        </div>

        <!-- Right Section: Image -->
        <div class="w-1/2 flex justify-center">
            <div class="relative">
                <!-- Background Elements -->


                <!-- Main Image -->
                <img :src="imageSrc" alt="Online Learning" class="z-10 " />
            </div>
        </div>
    </div>
</template>

<script>
import home from "@/assets/homepage.png";
export default {
    name: "OnlineLearning",
    data() {
        return {
            imageSrc: home
        };
    },
    methods: {
        goToRoute() {
            this.$router.push("/mock-interview"); // Replace with the desired route
        },
    },
};
</script>

<style></style>