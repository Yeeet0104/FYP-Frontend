<template>
    <div>
      <div class=" flex items-center ">

        <h1 class="w-36 text-center text-2xl p-2 text-black font-medium bg-gray-300 ">{{ chapter.name }}</h1>
      </div>
      <TreeDiagram :data="chapter.treeData" :chapterId="chapter.id"  />
    </div>
  </template>
  
  <script>
  import TreeDiagram from "@/components/TreeDiagram.vue";
  
  export default {
    components: {
      TreeDiagram,
    },
    data() {
      return {
        chapter: {
          id: this.$route.params.chapterId, // Extract chapter ID from route
          name: "",
          treeData: null, // Initialize as null
        },
      };
    },
    async created() {
      try {
        const response = await fetch(`http://localhost:3000/chapters/${this.chapter.id}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch chapter details");
        const data = await response.json();
        console.log("Fetched Chapter Data:", data);
  
        this.chapter.name = data.name; // Chapter name
        this.chapter.treeData = data.treeData; // Ensure this line is present
        console.log("Fetched Chapter Data:", this.chapter.name);
      } catch (error) {
        console.error("Error fetching chapter details:", error);
        alert("Unable to load chapter details.");
      }
    },
  };
  </script>
  