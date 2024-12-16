<template>
  <div class="mock-interview h-full">
    <h1 class="text-2xl font-bold mb-4">Mock Interview</h1>
    <div class="flex w-full gap-2 h-full">

      <!-- Sidebar -->
      <div class="bg-gray-900 text-white w-64 h-full flex-shrink-0 p-4">
        <h2 class="text-lg font-bold mb-4">Conversation History</h2>
        <ul>
          <li v-for="(conversation, index) in conversations" :key="index"
            @click="loadConversation(conversation.conversation_id)"
            class="cursor-pointer p-2 hover:bg-gray-700 rounded">
            {{ formatDate(conversation.timestamp) }} - Session {{ conversation.conversation_id }}
          </li>
        </ul>
      </div>

      <!-- Main Content -->
      <div class="flex-1">
        <!-- Dropdown for selecting question type and difficulty -->
        <div class="mb-4 flex gap-4">
          <div>
            <label for="question-type" class="block font-semibold">Select Question Type:</label>
            <select v-model="selectedType" class="w-full mt-2 p-2 border rounded">
              <option value="behavioral">Behavioral</option>
              <option value="data_science">Data Science</option>
              <option value="software_engineering">Software Engineering</option>
            </select>
          </div>
          <div>
            <label for="difficulty" class="block font-semibold">Select Difficulty Level:</label>
            <select v-model="selectedDifficulty" class="w-full mt-2 p-2 border rounded">
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <!-- Chat UI -->
        <div class="chat-box bg-gray-50 border rounded p-4 h-96 overflow-y-auto">
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
      </div>

      <!-- Feedback Panel with Toggle -->
      <div class="bg-gray-100 w-80 h-full flex-shrink-0 p-4 border-l">
        <button @click="toggleFeedback" class="mb-4 w-full bg-purple-500 text-white rounded px-4 py-2">
          {{ showFeedback ? "Hide Feedback" : "Show Feedback" }}
        </button>
        <div v-if="showFeedback" class="feedback-panel">
          <h3 class="text-lg font-bold mb-2">Feedback</h3>
          <div v-for="(feedbackItem, index) in feedbackHistory" :key="index" class="mb-4">
            <p><strong>User Response:</strong> {{ feedbackItem.userMessage }}</p>
            <p><strong>Feedback:</strong> {{ feedbackItem.feedback }}</p>
            <p><strong>Follow-Up Question:</strong> {{ feedbackItem.followUpQuestion }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedType: "behavioral",
      chatHistory: [{ sender: "Bot", text: "Welcome to your mock interview! Please introduce yourself." }],
      isRecording: false,
      audioBlob: null,
      interviewScore: null,
      selectedDifficulty: "easy",
      feedbackHistory: [], // Array to store feedback for each interaction
      showFeedback: true, // Toggle state for feedback panel
      conversations: [], // Initialize conversations as an empty array
    };
  },
  methods: {
    toggleRecording() {
      if (!this.isRecording) {
        this.startRecording();
      } else {
        this.stopRecording();
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
      formData.append("audio", this.audioBlob, "answer.wav");
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

        // Append Bot's response
        const botResponse = data.bot_response;
        // Update chat history
        this.chatHistory.push({ sender: "Bot", text: data.follow_up_question });
        console.log(this.chatHistory);

        // Store feedback
        this.feedbackHistory.push({
          userMessage: data.transcription,
          feedback: data.feedback,
          followUpQuestion: data.follow_up_question,
        });

        // Store conversation in history
        await this.storeConversation(userMessage, botResponse);

      } catch (error) {
        console.error("Error sending recording:", error);
      }
    },
    toggleFeedback() {
      this.showFeedback = !this.showFeedback;
    },
    async storeConversation(userMessage, botResponse) {
      try {
        const token = localStorage.getItem("token");
        console.log("Token", token);
        const response = await fetch("http://localhost:3000/store-history", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            conversationId: this.getConversationId(), // Generate or retrieve current conversation ID
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

    getConversationId() {
      // Example: Generate or retrieve the current conversation ID
      // You can store this in Vue's data or local storage to keep track of sessions
      if (!this.currentConversationId) {
        this.currentConversationId = Date.now(); // Use timestamp as a unique ID
      }
      return this.currentConversationId;
    },

    async fetchConversations() {
      try {
        const response = await fetch('http://localhost:3000/fetch-history', {
          method: 'GET',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await response.json();

        // Assign unique conversations with sorted timestamps
        this.conversations = data.history.map((conversation) => ({
          conversation_id: conversation.conversation_id,
          timestamp: conversation.latest_timestamp,
        }));
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    },
    async loadConversation(conversationId) {
      try {
        const response = await fetch(`http://localhost:3000/fetch-history?conversationId=${conversationId}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await response.json();

        // Clear the chatHistory before loading a new conversation
        this.chatHistory = [];

        // Map the conversation history into chatHistory
        data.history.forEach((entry) => {
          if (entry.user_message) {
            this.chatHistory.push({ sender: "User", text: entry.user_message });
          }
          if (entry.bot_response) {
            this.chatHistory.push({ sender: "Bot", text: entry.bot_response });
          }
        });

        console.log("Loaded conversation:", this.chatHistory);
      } catch (error) {
        console.error("Error loading conversation:", error);
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
.chat-box {
  max-height: 400px;
  overflow-y: scroll;
}

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
  max-height: calc(100% - 50px);
  overflow-y: auto;
}

.chat-box {
  max-height: 400px;
  overflow-y: scroll;
}
</style>