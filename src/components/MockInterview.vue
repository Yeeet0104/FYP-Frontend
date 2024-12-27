<template>
  <div class="mock-interview h-full  overflow-y-auto">
    <div class="flex w-full gap-2 h-full flex-col">
      <div>
        <h1 class="text-2xl font-bold mb-4">Mock Interview</h1>

      </div>
      <div class="flex w-full gap-2 h-full">

        <!-- Sidebar -->
        <div class="bg-gray-900 text-white w-64 p-4 side-panel">
          <!-- New Conversation Button -->
          <div class="mb-4">
            <h2 class="text-lg font-bold mb-4">Conversation History</h2>
            <button @click="startNewConversation" class="px-4 py-2 bg-red-500 text-white rounded">
              Start New Conversation
            </button>
          </div>
          <ul>
            <li v-for="(conversation, index) in conversations" :key="index"
              @click="loadConversation(conversation.conversation_id)"
              class="cursor-pointer p-2 hover:bg-gray-700 rounded">
              {{ formatDate(conversation.timestamp) }} - {{ conversation.name || `Session
              ${conversation.conversation_id}` }}
            </li>
          </ul>
        </div>

        <!-- Main Content -->
        <div class="flex-1 bg-gray-900">
          <!-- Placeholder when no conversation is active -->
          <div v-if="!conversationSettings.name" class="flex flex-col items-center justify-center h-full">
            <img :src="cat" alt="Start Conversation" class="w-48 h-48 mb-4 rounded" />
            <p class="text-white text-lg">Start a conversation to begin your mock interview!</p>
          </div>

          <!-- Chat and Settings when a conversation is active -->
          <div v-else class="h-auto">
            <div class="mb-4 flex gap-4">
              <button @click="showConversationSettings" class="px-4 py-2 bg-gray-500 text-white rounded">
                View Settings
              </button>
            </div>

            <div v-if="audioUrl" class="mt-4">
              <button @click="playAudio" class="px-4 py-2 bg-blue-500 text-white rounded">
                Play Response
              </button>
              <audio ref="audioPlayer" :src="audioUrl" controls style="display: none;"></audio>
            </div>

            <!-- Chat UI -->
            <div class="chat-box bg-gray-50 border rounded p-4 h-90">
              <div v-for="(msg, index) in chatHistory" :key="index" :class="['message', msg.sender]">
                <p :class="{
                  'bg-blue-100 text-left': msg.sender === 'Bot',
                  'bg-green-100 text-right': msg.sender === 'User'
                }" class="inline-block p-2 rounded-lg max-w-xs">
                  {{ msg.text }}
                </p>
              </div>
            </div>

            <!-- Record and Submit buttons -->
            <div class="flex items-center justify-between mt-4">
              <button @click="toggleRecording" class="px-4 py-2 bg-blue-500 text-white rounded">
                {{ isRecording ? "Stop Recording" : "Record Answer" }}
              </button>
              <button @click="sendRecording" :disabled="!audioBlob" class="px-4 py-2 bg-green-500 text-white rounded">
                Submit Answer
              </button>
            </div>

            <!-- Feedback Section -->
            <div class="feedback-section mt-6 m-2">
              <h3 class="text-lg font-bold mb-2">Feedback</h3>
              <div v-if="paginatedFeedback">
                <div>
                  <p><strong>Question:</strong> {{ paginatedFeedback.userMessage }}</p>
                  <p><strong>Feedback:</strong> {{ paginatedFeedback.feedback }}</p>
                  <p><strong>Grammar:</strong> {{ paginatedFeedback.grammarFeedback }}</p>
                </div>
                <!-- Pagination Controls -->
                <div class="flex justify-between mt-4">
                  <button @click="prevFeedback" :disabled="currentFeedbackPage === 1"
                    class="px-4 py-2 bg-gray-500 text-white rounded">
                    Previous
                  </button>
                  <button @click="nextFeedback" :disabled="currentFeedbackPage === totalFeedbackPages"
                    class="px-4 py-2 bg-gray-500 text-white rounded">
                    Next
                  </button>
                </div>
              </div>
              <div v-else>
                <p>No feedback available yet.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>



<script>
import Swal from "sweetalert2";
import cat from "@/assets/CAT.jpeg";
export default {
  data() {
    return {
      cat,
      selectedType: "behavioral",
      chatHistory: [{ sender: "Bot", text: "Welcome to your mock interview! Please introduce yourself." }],
      isRecording: false,
      audioBlob: null,
      interviewScore: null,
      selectedDifficulty: "easy",
      jobDescription: "",
      skillsNeeded: "",
      selectedHistoryId: null, // ID of the selected conversation
      feedbackHistory: [], // Array to store feedback for each interaction
      currentFeedbackPage: 1, // Current page for feedback
      itemsPerPage: 1, // Number of feedback items per page
      showFeedback: true, // Toggle state for feedback panel
      conversationSettings: {}, // Store conversation settings
      grammarFeedback: [], // Initialize grammar feedback
      conversations: [], // Initialize conversations as an empty array
      audioUrl: null, // URL for bot response audio
    };
  },
  computed: {
    paginatedFeedback() {
      const start = (this.currentFeedbackPage - 1) * this.itemsPerPage;
      console.log("Feedback History:", this.feedbackHistory);
      return this.feedbackHistory[start];
    },

    totalFeedbackPages() {
      return Math.ceil(this.feedbackHistory.length / this.itemsPerPage);
    },
  },
  methods: {
    showConversationSettings() {
      if (!this.conversationSettings.name) {
        Swal.fire("No Settings", "No settings are available for this conversation.", "info");
        return;
      }

      Swal.fire({
        title: "Conversation Settings",
        html: `
      <p><strong>Name:</strong> ${this.conversationSettings.name}</p>
      <p><strong>Job Description:</strong> ${this.conversationSettings.jobDescription || "Not provided"}</p>
      <p><strong>Skills Needed:</strong> ${this.conversationSettings.skillsNeeded || "Not provided"}</p>
      <p><strong>Difficulty:</strong> ${this.conversationSettings.difficulty || "Not set"}</p>
    `,
        confirmButtonText: "Close",
      });
    },


    nextFeedback() {
      if (this.currentFeedbackPage < this.totalFeedbackPages) {
        this.currentFeedbackPage++;
      }
    },
    prevFeedback() {
      if (this.currentFeedbackPage > 1) {
        this.currentFeedbackPage--;
      }
    },
    toggleRecording() {
      if (!this.isRecording) {
        this.startRecording();
      } else {
        this.stopRecording();
      }
    },
    async startNewConversation() {
      // Open a Swal popup to collect conversation details
      this.conversationSettings = {};

      const { value: formValues } = await Swal.fire({
        title: "Start New Conversation",
        html:
          '<input id="swal-name" class="swal2-input" placeholder="Conversation Name">' +
          '<textarea id="swal-job-description" class="swal2-textarea" placeholder="Job Description"></textarea>' +
          '<textarea id="swal-skills-needed" class="swal2-textarea" placeholder="Skills Needed"></textarea>' +
          '<select id="swal-difficulty" class="swal2-select">' +
          '<option value="easy">Easy</option>' +
          '<option value="medium">Medium</option>' +
          '<option value="hard">Hard</option>' +
          "</select>",
        focusConfirm: false,
        preConfirm: () => {
          return {
            name: document.getElementById("swal-name").value,
            jobDescription: document.getElementById("swal-job-description").value,
            skillsNeeded: document.getElementById("swal-skills-needed").value,
            difficulty: document.getElementById("swal-difficulty").value,
          };
        },
      });

      if (formValues) {
        // Initialize conversation settings
        this.selectedHistoryId = null; // Reset the conversation ID
        this.chatHistory = [
          { sender: "Bot", text: "Welcome to your mock interview! Please introduce yourself." },
        ];
        this.feedbackHistory = [];
        this.conversationSettings = formValues; // Save the entered settings
        console.log("New conversation started:", this.conversationSettings);
      }
    },

    async startRecording() {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      const chunks = [];
      this.mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      this.mediaRecorder.onstop = () => {
        this.audioBlob = new Blob(chunks, { type: "audio/wav" });
      };
      this.mediaRecorder.start();
      this.isRecording = true;
    },
    stopRecording() {
      this.mediaRecorder.stop();
      this.isRecording = false;
    },
    async sendRecording() {
      const formData = new FormData();
      formData.append("type", this.selectedType);
      formData.append("difficulty", this.selectedDifficulty);
      formData.append("jobDescription", this.jobDescription);
      formData.append("skillsNeeded", this.skillsNeeded);
      formData.append("name", this.conversationSettings.name)
      formData.append("audio", this.audioBlob, "answer.wav");
      // Include conversationId for continuing sessions
      if (!this.selectedHistoryId) {
        this.selectedHistoryId = Date.now(); // Generate a new ID if none exists
      }
      formData.append("conversationId", this.selectedHistoryId);
      formData.append("history", JSON.stringify(this.chatHistory));
      // Add User's answer placeholder while processing
      this.chatHistory.push({ sender: "User", text: "Processing your answer..." });

      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3000/mock-interview", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const data = await response.json();

        // Replace placeholder with transcribed answer
        const userMessage = data.transcription;
        this.chatHistory[this.chatHistory.length - 1].text = userMessage;
        console.log("data Message:", data);
        // Append Bot's response
        const botResponse = data.bot_response;
        // Update chat history
        this.chatHistory.push({ sender: "Bot", text: data.follow_up_question });
        console.log(this.chatHistory);
        console.log("Bot Response:", botResponse);
        // Store feedback
        this.feedbackHistory.push({
          userMessage: data.transcription,
          feedback: data.feedback,
          grammarFeedback: data.grammar,
          followUpQuestion: data.follow_up_question,
        });


        if (data.audio_filename) {
          // Fetch the audio file from the separate endpoint
          const audioResponse = await fetch(`http://localhost:3000/get-audio/${data.audio_filename}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` }
          });
          if (audioResponse.ok) {
            const audioBlob = await audioResponse.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            // Auto-play the audio
            const audio = new Audio(audioUrl);
            audio.play();
          }
        }
        console.log("Feedback History:", userMessage, botResponse);
        console.log("bot respond:", botResponse);
        // Store conversation in history


      } catch (error) {
        console.error("Error sending recording:", error);
      }
    },
    toggleFeedback() {
      this.showFeedback = !this.showFeedback;
    },
    playAudio() {
      this.$refs.audioPlayer.play();
    },
    async storeConversation(userMessage, botResponse) {
      console.log("Storing conversation:", userMessage, botResponse);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3000/store-history", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            conversationId: this.selectedHistoryId, // Use the same conversation ID
            userMessage,
            botResponse,
          }),
        });

        const data = await response.json();
        if (data.message) {
          console.log("Conversation stored successfully.");
        } else {
          console.error("Failed to store conversation:", data.error);
        }
      } catch (error) {
        console.error("Error storing conversation:", error);
      }
    },


    async fetchConversations() {
      try {
        const response = await fetch("http://localhost:3000/fetch-history", {
          method: "GET",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await response.json();

        this.conversations = data.history.map((conversation) => ({
          conversation_id: conversation.conversation_id,
          name: conversation.name || `Session ${conversation.conversation_id}`,
          timestamp: conversation.latest_timestamp,
        }));
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    },

    async loadConversation(conversationId) {
      try {
        console.log("Loading conversation:", conversationId);
        const response = await fetch(`http://localhost:3000/fetch-history?conversationId=${conversationId}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await response.json();

        // Update selectedHistoryId for continuation
        this.selectedHistoryId = conversationId;
        this.feedbackHistory = [];
        this.chatHistory = []; // Clear the chat history before loading a new conversation

        console.log("Loaded conversation data:", data);

        // Map the conversation history into chatHistory
        data.history.forEach((entry) => {
          if (entry.user_message) {
            this.chatHistory.push({ sender: "User", text: entry.user_message });
          }
          if (entry.bot_response) {
            this.chatHistory.push({ sender: "Bot", text: entry.bot_response });
          }
          if (entry.feedback) {
            this.feedbackHistory.push({
              userMessage: entry.user_message,
              feedback: entry.feedback,
              grammarFeedback: entry.grammar_feedback,
            });
          }
        });

        // Populate conversation settings or use defaults
        this.conversationSettings = {
          name: data.settings?.name || `Session ${conversationId}`,
          jobDescription: data.settings?.jobDescription || "No job description provided",
          skillsNeeded: data.settings?.skillsNeeded || "No skills needed provided",
          difficulty: data.settings?.difficulty || "easy",
        };

        console.log("Conversation Settings:", this.conversationSettings);
      } catch (error) {
        console.error("Error loading conversation:", error);

        // Use default settings in case of an error
        this.conversationSettings = {
          name: `Session ${conversationId}`,
          jobDescription: "No job description provided",
          skillsNeeded: "No skills needed provided",
          difficulty: "easy",
        };

        console.warn("Default settings applied for the conversation.");
      }
    },


    formatDate(timestamp) {
      return new Date(timestamp).toLocaleDateString();
    },
  },
  mounted() {
    this.fetchConversations();
  },
};
</script>

<style>
.message {
  margin: 10px 0;
  display: flex;
  flex-direction: column;
}

.message.Bot {
  align-items: flex-start;
}

.message.User {
  align-items: flex-end;
}

.feedback-panel {
  max-height: calc(100vh - 130px);
  /* Adjust height dynamically based on viewport */
  overflow-y: auto;
  /* Enable scrolling for overflowing content */
  padding-right: 8px;
  /* Add some space for the scrollbar */
}

.side-panel {
  max-height: calc(100vh - 130px);
  /* Adjust height dynamically based on viewport */
  overflow-y: auto;
  /* Enable scrolling for overflowing content */
}

.chat-box {
  min-height: 600px;
  overflow-y: scroll;
}

.feedback-section {
  background-color: #f8fafc;
  /* Light gray background */
  border: 1px solid #e5e7eb;
  /* Light border */
  padding: 16px;
  border-radius: 8px;
}

.feedback-section p {
  margin-bottom: 8px;
}
</style>