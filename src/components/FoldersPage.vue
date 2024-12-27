<template>
  <div class="h-full bg-gray-900 p-6">
    <h2 class="text-2xl text-white mb-6">Notes</h2>

    <!-- Add Folder Button -->
    <button
      @click="createFolder"
      class="bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg shadow hover:shadow-lg hover:from-green-600 hover:to-green-700 transition duration-300 mb-6"
    >
      + Add Folder
    </button>

    <!-- List of Folders -->
    <div class="flex flex-wrap gap-4">
      <div
        v-for="folder in folders"
        :key="folder.id"
        @click="goToChapters(folder)"
        class="flex flex-col justify-between bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-center rounded-lg p-4 w-44 h-28 shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 cursor-pointer relative"
      >
        <span class="text-lg font-semibold" >
          {{ folder.name }}
        </span>

        <div class="flex flex-row justify-between items-center ">
            <!-- Delete Folder Button -->
            <button
              @click.stop="deleteFolder(folder.id)"
              class=" bg-red-500 text-white text-sm py-1 px-2 rounded hover:bg-red-600"
            >
              Delete
            </button>
    
            <!-- Edit Folder Button -->
            <button
              @click.stop="editFolder(folder)"
              class=" bg-yellow-500 text-white text-sm py-1 px-2 rounded hover:bg-yellow-600"
            >
              Edit
            </button>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from "sweetalert2";
import api from "@/api/api";

export default {
  data() {
    return {
      folders: [], // Fetched from the backend
    };
  },
  async created() {
    await this.fetchFolders(); // Fetch folders on component load
  },
  methods: {
    // Fetch folders from the backend
    async fetchFolders() {
      try {
        const response = await api.get("/folders");
        this.folders = response.data; // Use response.data for Axios
        console.log("fetch Folders:", this.folders);
      } catch (error) {
        console.error("Error fetching folders:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Unable to load folders.",
        });
      }
    },

    // Navigate to chapters of a folder
    goToChapters(folder) {
      console.log("Navigating to chapters of folder:", folder.name);
      this.$router.push({
        path: `/folders/${folder.id}/chapters`,
        params: { name: folder.name }, // Pass the folder name as a route parameter
      });
    },

    // Create a new folder
    async createFolder() {
      try {
        const { value: folderName } = await Swal.fire({
          title: "Create Folder",
          input: "text",
          inputLabel: "Folder Name",
          inputPlaceholder: "Enter folder name",
          showCancelButton: true,
          confirmButtonText: "Create",
          inputValidator: (value) => {
            if (!value) {
              return "Folder name cannot be empty!";
            }
          },
        });

        if (!folderName) return; // User canceled

        const response = await api.post("/folders", { name: folderName });
        this.folders.push(response.data); // Add new folder to the list
        console.log("Folder created:", response.data);
        console.log("Folder:",  this.folders);
        Swal.fire({
          icon: "success",
          title: "Folder Created",
          text: `Folder "${folderName}" has been created successfully.`,
        });
      } catch (error) {
        console.error("Error creating folder:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Unable to create folder.",
        });
      }
    },

    // Edit folder
    async editFolder(folder) {
      try {
        const { value: newFolderName } = await Swal.fire({
          title: "Edit Folder",
          input: "text",
          inputLabel: "New Folder Name",
          inputPlaceholder: "Enter new folder name",
          inputValue: folder.name, // Pre-fill with the current name
          showCancelButton: true,
          confirmButtonText: "Save",
          inputValidator: (value) => {
            if (!value) {
              return "Folder name cannot be empty!";
            }
          },
        });

        if (!newFolderName) return; // User canceled

        await api.put(`/folders/${folder.id}`, { name: newFolderName });
        folder.name = newFolderName; // Update folder name in the list

        Swal.fire({
          icon: "success",
          title: "Folder Updated",
          text: `Folder "${newFolderName}" has been updated successfully.`,
        });
      } catch (error) {
        console.error("Error updating folder:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Unable to update folder.",
        });
      }
    },

    // Delete folder
    async deleteFolder(folderId) {
      try {
        const confirmDelete = await Swal.fire({
          title: "Delete Folder",
          text: "Are you sure you want to delete this folder? This action cannot be undone.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Delete",
          cancelButtonText: "Cancel",
        });

        if (!confirmDelete.isConfirmed) return; // User canceled

        await api.delete(`/folders/${folderId}`);
        this.folders = this.folders.filter((folder) => folder.id !== folderId); // Remove from local list

        Swal.fire({
          icon: "success",
          title: "Folder Deleted",
          text: "The folder has been deleted successfully.",
        });
      } catch (error) {
        console.error("Error deleting folder:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Unable to delete folder.",
        });
      }
    },
  },
};
</script>
