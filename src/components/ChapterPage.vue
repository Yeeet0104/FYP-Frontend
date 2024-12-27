<template>
  <div class="h-full bg-gray-900 text-white p-6 overflow-y-auto">
    <!-- Folder Name -->
    <h2 class="text-3xl font-bold mb-6 text-purple-400">{{ folder.name }}</h2>

    <!-- Add Chapter Button -->
    <button @click="uploadChapter"
      class="bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-2 px-4 rounded-lg shadow hover:shadow-lg hover:from-purple-600 hover:to-indigo-700 transition duration-300 mb-4">
      + Add Chapter
    </button>

    <!-- List of Chapters -->
    <ul class="space-y-4">
      <li v-for="chapter in folder.chapters" :key="chapter.id"
        class="flex justify-between items-center bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition duration-300">
        <span @click="goToTree(chapter)" class="cursor-pointer text-lg font-semibold hover:text-purple-400">
          {{ chapter.name }}
        </span>
        <button @click="deleteChapter(chapter.id)"
          class="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600 transition duration-300">
          Delete
        </button>
      </li>
    </ul>
  </div>
</template>


<script>
import api from '@/api/api';
import Swal from "sweetalert2";
export default {
  data() {
    return {
      folder: {
        id: this.$route.params.folderId, // Extract folder ID from route
        name: this.$route.params.name,
        chapters: [] // Fetched from the backend
      }
    };
  },
  async created() {
    try {
      console.log("Folder ID:", this.folder.id);
      console.log("Folder name:", this.folder.name);
      const response = await api.get(`/folders/${this.folder.id}/chapters`);
      const data = await response.data;
      this.folder.name = data.folderName; // Use the folder name from backend response
      this.folder.chapters = data
    } catch (error) {
      console.error("Error fetching chapters:", error);
      alert("Unable to load chapters.");
    }
  }
  ,
  methods: {
    goToTree(chapter) {
      this.$router.push(`/chapters/${chapter.id}/tree`); // Navigate to the tree diagram page
    },
    async uploadChapter() {
      try {
        // Prompt the user to input the chapter name
        const { value: chapterName } = await Swal.fire({
          title: "Enter Chapter Name",
          input: "text",
          inputLabel: "Chapter Name",
          inputPlaceholder: "Type the chapter name here...",
          showCancelButton: true,
          confirmButtonText: "Next",
          inputValidator: (value) => {
            if (!value) {
              return "You need to enter a chapter name!";
            }
          },
        });

        if (!chapterName) {
          return; // User canceled the dialog
        }

        // File upload dialog
        const { value: file } = await Swal.fire({
          title: "Upload PDF File",
          text: "Please select a PDF file for the chapter.",
          input: "file",
          inputAttributes: {
            accept: ".pdf",
          },
          showCancelButton: true,
          confirmButtonText: "Upload",
          inputValidator: (value) => {
            if (!value) {
              return "You need to select a file!";
            }
          },
        });

        if (!file) {
          return; // User canceled the dialog
        }

        // Create FormData for the upload
        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", chapterName);
        formData.append("folderId", this.folder.id);

        // Show a loading Swal while the file is being uploaded
        Swal.fire({
          title: "Uploading...",
          text: "Please wait while your chapter is being uploaded.",
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        // Upload the file to the backend
        const response = await fetch("http://localhost:3000/chapters", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        });

        if (!response.ok) throw new Error("Failed to create chapter");

        const data = await response.json();
        console.log("Chapter uploaded:", data);

        // Update local chapter list
        if (!Array.isArray(this.folder.chapters)) {
          this.folder.chapters = [];
        }
        this.folder.chapters.push({
          id: data.chapterId,
          name: data.name,
        });

        // Close the loading Swal and show success notification
        Swal.close();
        Swal.fire({
          icon: "success",
          title: "Chapter Added",
          text: "The chapter has been successfully added.",
        });
      } catch (error) {
        console.error("Error uploading chapter:", error);

        // Close the loading Swal and show error notification
        Swal.close();
        Swal.fire({
          icon: "error",
          title: "Upload Failed",
          text: "An error occurred while uploading the chapter.",
        });
      }
    },


    async deleteChapter(chapterId) {
      const confirmDelete = confirm("Are you sure you want to delete this chapter?");
      if (!confirmDelete) return;

      try {
        const response = await fetch(`http://localhost:3000/chapters/${chapterId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });
        if (!response.ok) throw new Error("Failed to delete chapter");

        // Remove the chapter from the local list
        this.folder.chapters = this.folder.chapters.filter(chapter => chapter.id !== chapterId);

        alert("Chapter deleted successfully!");
      } catch (error) {
        console.error("Error deleting chapter:", error);
        alert("Unable to delete chapter.");
      }
    }
  }
};
</script>
