<template>
  <div class="h-full overflow-y-auto bg-gray-50 p-6">
    <div class="max-w-4xl mx-auto bg-gray-100 rounded-xl shadow-md">
      <div class="border-t border-b rounded-xl px-6 py-3 flex items-center">
        <button class="text-blue-600 font-medium border-b-2 border-blue-600 py-2">
          Profile
        </button>
        <Icon :icon="accountIcon" class="text-2xl ml-2 mt-1" />
      </div>

      <div class="p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-6">
            <div class="relative">
              <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                <img :src="profilePictureUrl" alt="Profile Picture" class="w-24 h-24 rounded-full object-cover" />
              </div>
              <button class="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full text-white">
                <Icon icon="mdi:camera" class="w-4 h-4" />
                <input type="file" @change="onFileChange" class="absolute inset-0 opacity-0 cursor-pointer" />
              </button>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 v-if="!isEditingUsername" class="text-2xl font-bold text-gray-900">{{ username }}</h1>
                <input v-else v-model="newUsername"
                  class="text-2xl font-bold text-gray-900 border-b-2 border-gray-300 focus:outline-none" />
                <button @click="toggleEditUsername" class="text-gray-500 hover:text-gray-700">
                  <Icon :icon="isEditingUsername ? 'mdi:check' : 'mdi:pencil'" class="w-5 h-5" />
                </button>
              </div>
              <p class="text-gray-500 text-sm">Joined December 2024</p>
            </div>
          </div>
          <button @click="toggleLogoutModal" class="text-red-500 hover:text-red-600 flex items-center gap-2">
            <Icon icon="mdi:logout" class="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white p-6 rounded-lg shadow-lg">
        <h2 class="text-xl font-bold mb-4">Confirm Change</h2>
        <p>Are you sure you want to change your profile picture?</p>
        <div class="mt-6 flex justify-end space-x-4">
          <button @click="confirmChange" class="bg-blue-500 text-white px-4 py-2 rounded">Yes</button>
          <button @click="cancelChange" class="bg-gray-300 text-gray-700 px-4 py-2 rounded">No</button>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal for Username -->
    <div v-if="showUsernameModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white p-6 rounded-lg shadow-lg">
        <h2 class="text-xl font-bold mb-4">Confirm Change</h2>
        <p>Are you sure you want to change your username?</p>
        <div class="mt-6 flex justify-end space-x-4">
          <button @click="confirmUsernameChange" class="bg-blue-500 text-white px-4 py-2 rounded">Yes</button>
          <button @click="cancelUsernameChange" class="bg-gray-300 text-gray-700 px-4 py-2 rounded">No</button>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal for Email -->
    <div v-if="showEmailModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white p-6 rounded-lg shadow-lg">
        <h2 class="text-xl font-bold mb-4">Confirm Change</h2>
        <p>Are you sure you want to change your email?</p>
        <div class="mt-6 flex justify-end space-x-4">
          <button @click="saveEmail" class="bg-blue-500 text-white px-4 py-2 rounded">Yes</button>
          <button @click="cancelEmailChange" class="bg-gray-300 text-gray-700 px-4 py-2 rounded">No</button>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal for Logout -->
    <div v-if="showLogoutModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white p-6 rounded-lg shadow-lg">
        <h2 class="text-xl font-bold mb-4">Confirm Logout</h2>
        <p>Are you sure you want to logout?</p>
        <div class="mt-6 flex justify-end space-x-4">
          <button @click="confirmLogout" class="bg-blue-500 text-white px-4 py-2 rounded">Yes</button>
          <button @click="cancelLogout" class="bg-gray-300 text-gray-700 px-4 py-2 rounded">No</button>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="max-w-4xl mt-10 mx-auto border-t bg-gray-100 rounded-lg shadow-md p-6">
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-medium text-gray-900">Details</h3>
        </div>

        <div class="border-t pt-6">
          <dl class="mt-1 space-y-4">
            <div class="flex items-center">
              <dt class="w-32 font-medium text-gray-500">Email<i class="fa-regular fa-envelope ml-3"></i></dt>
            </div>
            <dd class="text-sm text-gray-900">
              <div class="relative">
                <!-- Input Field -->
                 <span v-if="!isEditingEmail" class="mt-1 block w-full px-3 py-2 pr-10 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  {{ email }}
                 </span>
                <input type="text" v-if="isEditingEmail" v-model="newEmail"
                  class="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />

                <!-- Icon -->
                <Icon @click="toggleEditEmail" :icon="isEditingEmail ? 'mdi:check' : 'mdi:pencil'"
                  class="absolute top-1/2 right-3 transform -translate-y-1/2 w-5 h-5 text-gray-400 cursor-pointer" />
              </div>
            </dd>
          </dl>
        </div>

        <!-- Password Change Section -->
        <div class="pt-6">
          <h3 class="text-lg font-medium text-gray-900">Change Password <i class="fa-solid fa-lock ml-2"></i></h3>
          <div class="mt-4 space-y-4">
            <div>
              <label for="newPassword" class="block text-sm font-medium text-gray-700">New Password</label>
              <div class="relative">
                <input :type="showNewPassword ? 'text' : 'password'" id="newPassword" v-model="newPassword"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                <button type="button" @click="toggleNewPasswordVisibility"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
                  <Icon :icon="showNewPassword ? 'mdi:eye-off' : 'mdi:eye'" class="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div class="mt-2 text-sm text-gray-600">
                <p>Password must contain:</p>
                <ul class="list-disc list-inside">
                  <li :class="getValidationClass(minLengthValid)">At least 8 characters</li>
                  <li :class="getValidationClass(uppercaseValid)">At least one uppercase letter</li>
                  <li :class="getValidationClass(lowercaseValid)">At least one lowercase letter</li>
                  <li :class="getValidationClass(numberValid)">At least one number</li>
                  <li :class="getValidationClass(specialCharValid)">At least one special character (e.g., !, @, #)</li>
                </ul>
              </div>
            </div>
            <div>
              <label for="confirmNewPassword" class="block text-sm font-medium text-gray-700">Confirm New
                Password</label>
              <div class="relative">
                <input :type="showConfirmNewPassword ? 'text' : 'password'" id="confirmNewPassword"
                  v-model="confirmNewPassword"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                <button type="button" @click="toggleConfirmNewPasswordVisibility"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
                  <Icon :icon="showConfirmNewPassword ? 'mdi:eye-off' : 'mdi:eye'" class="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div class="flex justify-end">
              <button @click="changePassword"
                class="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Change
                Password</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { Icon } from '@iconify/vue';
import accountIcon from '@iconify-icons/mdi/account';
import cameraIcon from '@iconify-icons/mdi/camera';
import logoutIcon from '@iconify-icons/mdi/logout';

export default {
  components: {
    Icon,
  },
  data() {
    return {
      username: '',
      email: '',
      createdAt: '',
      profilePictureUrl: '',
      accountIcon,
      cameraIcon,
      logoutIcon,
      showModal: false,
      showUsernameModal: false,
      showEmailModal: false,
      showLogoutModal: false,
      selectedFile: null,
      isEditingUsername: false,
      newUsername: '',
      currentPassword: '',
      newPassword: '',
      newEmail: '',
      confirmNewPassword: '',
      showPassword: false,
      showNewPassword: false,
      showConfirmNewPassword: false,
      minLengthValid: false,
      uppercaseValid: false,
      lowercaseValid: false,
      numberValid: false,
      specialCharValid: false,
      isEditingEmail: false
    };
  },
  watch: {
    newPassword(value) {
      this.minLengthValid = /.{8,}/.test(value);
      this.uppercaseValid = /[A-Z]/.test(value);
      this.lowercaseValid = /[a-z]/.test(value);
      this.numberValid = /[0-9]/.test(value);
      this.specialCharValid = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    },
  },
  methods: {
    async fetchUser() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("Token is missing.");
          return;
        }

        const response = await axios.get(
          "http://localhost:3000/fetch-user",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const userData = response.data.userData;
        this.username = userData.username;
        this.email = userData.email;
        this.currentPassword = userData.password;
        this.createdAt = new Date(userData.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        this.profilePictureUrl = userData.profilePictureUrl || '';
      } catch (error) {
        console.error("Error fetching user data:", error.response ? error.response.data : error.message);
      }
    },
    onFileChange(event) {
      const file = event.target.files[0];
      if (!file) return;

      this.selectedFile = file;
      this.showModal = true;
    },
    async confirmChange() {
      if (!this.selectedFile) return;

      const formData = new FormData();
      formData.append('profilePicture', this.selectedFile);

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("Token is missing.");
          return;
        }

        const response = await axios.post(
          "http://localhost:3000/upload-profile-picture",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        this.profilePictureUrl = response.data.profilePictureUrl;
        this.showModal = false;
        this.selectedFile = null;
      } catch (error) {
        console.error("Error uploading profile picture:", error.response ? error.response.data : error.message);
      }
    },
    cancelChange() {
      this.showModal = false;
      this.selectedFile = null;
    },
    toggleEditUsername() {
      if (this.isEditingUsername) {
        this.showUsernameModal = true;
      } else {
        this.isEditingUsername = !this.isEditingUsername;
      }
    },
    async confirmUsernameChange() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("Token is missing.");
          return;
        }

        await axios.post(
          "http://localhost:3000/update-user-details",
          { username: this.newUsername, email: this.email, location: this.location },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        this.username = this.newUsername;
        this.isEditingUsername = false;
        this.showUsernameModal = false;
      } catch (error) {
        console.error("Error updating user details:", error.response ? error.response.data : error.message);
      }
    },
    cancelUsernameChange() {
      this.showUsernameModal = false;
      this.newUsername = this.username;
      this.isEditingUsername = false;
    },
    cancelEmailChange() {
      this.showEmailModal = false;
      this.newEmail = this.email;
      this.isEditingEmail = false;
    },
    toggleLogoutModal() {
      this.showLogoutModal = true;
    },
    confirmLogout() {
      localStorage.removeItem("token");
      window.location.href = "/login";
    },
    cancelLogout() {
      this.showLogoutModal = false;
    },
    setActiveTab(tab) {
      this.activeTab = tab;
    },
    toggleNewPasswordVisibility() {
      this.showNewPassword = !this.showNewPassword;
    },
    toggleConfirmNewPasswordVisibility() {
      this.showConfirmNewPassword = !this.showConfirmNewPassword;
    },
    getValidationClass(isValid) {
      if (!this.newPassword) {
        return 'text-gray-600';  // Default color if there's no input
      }
      return isValid ? 'text-green-500' : 'text-red-500';  // Red for invalid, green for valid
    },
    validatePassword(password) {
      const minLength = /.{8,}/;
      const uppercase = /[A-Z]/;
      const lowercase = /[a-z]/;
      const number = /[0-9]/;
      const specialChar = /[!@#$%^&*(),.?":{}|_<>]/;

      return (
        minLength.test(password) &&
        uppercase.test(password) &&
        lowercase.test(password) &&
        number.test(password) &&
        specialChar.test(password)
      );
    },
    async changePassword() {
      if (!this.validatePassword(this.newPassword)) {
        alert("New password does not meet the requirements.");
        return;
      }

      if (this.newPassword !== this.confirmNewPassword) {
        alert("New passwords do not match.");
        return;
      }

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("Token is missing.");
          return;
        }

        await axios.post(
          "http://localhost:3000/change-password",
          { newPassword: this.newPassword },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        alert("Password changed successfully.");
        this.newPassword = '';
        this.confirmNewPassword = '';
      } catch (error) {
        console.error("Error changing password:", error.response ? error.response.data : error.message);
      }
    },
    toggleEditEmail() {
      if (this.isEditingEmail) {
        this.showEmailModal = true;
      } else {
        this.isEditingEmail = !this.isEditingEmail;
      }
    },
    async saveEmail() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.post('http://localhost:3000/update-email', {
          email: this.newEmail
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Email updated:', response.data);
        this.email = this.newEmail;
        this.isEditingEmail = false;
        this.showEmailModal = false;
      } catch (error) {
        console.error('Error updating email:', error.response?.data || error.message);
      }
    },
  },
  created() {
    this.fetchUser();
  },
};
</script>