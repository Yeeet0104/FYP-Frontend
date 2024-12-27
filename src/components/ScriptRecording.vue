<template>
  <div class="h-full flex flex-col">
    <!-- Left Section: Script Generation -->
    <div class="flex-grow grid grid-cols-2 gap-6">
      <!-- Script Options and Generation -->
      <div class="bg-gray-100 p-6 m-3 rounded">
        <!-- Dropdown for tone -->
        <div class="w-full flex flex-row justify-evenly gap-10">
          <div class="w-1/2">
            <label class="block mb-2 font-semibold">Tone:</label>
            <select v-model="selectedTone" class="w-full mb-4 p-2 border rounded">
              <option value="formal">Formal</option>
              <option value="informal">Informal</option>
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
            </select>

          </div>
          <div class="w-1/2">
            <label class="block mb-2 font-semibold">Difficulty:</label>
            <select v-model="selectedLevel" class="w-full mb-4 p-2 border rounded">
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

          </div>

        </div>
        <textarea v-model="script" class="resize-none w-full h-2/5 border rounded-lg p-4 focus:ring"
          readonly></textarea>
        <button @click="generateScript" class="w-full mt-4 bg-purple-500 text-white rounded-lg px-4 py-2">
          Generate Script
        </button>
      </div>

      <!-- Audio Recording and Evaluation -->
      <div class="bg-gray-50 p-6 m-3 rounded">
        <audio v-if="audioBlob" controls :src="audioUrl" class="mt-6 w-full"></audio>
        <div class="grid grid-cols-2 justify-center w-full">
          <button @click="toggleRecording" class="col-span-1 py-4 px-2 m-3 bg-red-500 text-white rounded-lg">
            {{ isRecording ? "Stop Recording" : "Start Recording" }}
          </button>
          <button @click="evaluateRecording" class="col-span-1 py-4 px-2 m-3 bg-green-500 text-white rounded-lg"
            :disabled="!audioBlob || !script">
            Evaluate
          </button>
        </div>
      </div>
    </div>
    <!-- Feedback Section -->
    <div v-if="feedback.feedback" class="bg-gray-100 p-6 mt-4 rounded-lg shadow-md overflow-y-auto max-h-[80vh]">
      <h3 class="text-2xl font-bold text-purple-700 mb-4">Evaluation Feedback</h3>

      <!-- Circular Scores -->
      <div class="flex justify-around mb-6">
        <div>
          <div class="relative flex items-center justify-center">
            <!-- Circular Progress Bar -->
            <circle-progress :percent="feedback.pronunciation_scores || 0" :size="150" :stroke="8" color="#4CAF50"
              track-color="#ddd" text-color="transparent" />

            <!-- Centered Text -->
            <span class="absolute text-center text-lg w-3/4 font-bold text-purple-700">
              Pronunciation: {{ feedback.pronunciation_scores || 0 }}%
            </span>
          </div>
        </div>
        <div>
          <div class="relative flex items-center justify-center">
            <!-- Circular Progress Bar -->
            <circle-progress :percent="feedback.fluency_score || 0" :size="150" :stroke="8" color="#4CAF50"
              track-color="#ddd" text-color="transparent" />

            <!-- Centered Text -->
            <span class="absolute text-center text-lg w-3/4 font-bold text-purple-700">
              Fluency: {{ feedback.fluency_score || 0 }}%
            </span>
          </div>
        </div>
        <div>
          <div class="relative flex items-center justify-center">
            <!-- Circular Progress Bar -->
            <circle-progress :percent="feedback.prosody_score || 0" :size="150" :stroke="8" color="#4CAF50"
              track-color="#ddd" text-color="transparent" />

            <!-- Centered Text -->
            <span class="absolute text-center text-lg w-3/4 font-bold text-purple-700">
              Prosody: {{ feedback.prosody_score || 0 }}%
            </span>
          </div>
        </div>
      </div>

      <!-- Highlighted Transcription -->
      <div class="mb-6">
        <h4 class="text-lg font-bold">Transcription:</h4>
        <p>
          <span v-for="(word, index) in feedback.transcription.split(' ')" :key="index" :class="getWordClass(word)"
            class="rounded px-2 mx-1 inline-block">
            {{ word }}
          </span>
        </p>
      </div>
      <div class="mb-6">
        <h3 class="text-lg font-bold">Original Script:</h3>
        <p>{{ script }}</p>

        <h3 class="text-lg font-bold mt-4">User Transcription:</h3>
        <p v-html="highlightedUser"></p>
      </div>


      <div class="mb-6">
        <h4 class="text-lg font-bold">Detailed Feedback:</h4>
        <div v-if="structuredFeedback.length">
          <div v-for="(section, index) in structuredFeedback" :key="index"
            class="bg-gray-200 p-4 m-2 rounded shadow-md">
            <h5 class="text-xl font-bold mb-2 text-purple-700">{{ section.header }}</h5>
            <ul class="list-disc pl-5 text-gray-800">
              <li v-for="(item, i) in section.items" :key="i">{{ item }}</li>
            </ul>
          </div>
        </div>
        <div v-else>
          <p>No feedback available.</p>
        </div>
      </div>

    </div>

  </div>
</template>



<script>
import CircleProgress from "vue3-circle-progress";
import diff_match_patch from "diff-match-patch";
import { useToast } from "vue-toastification";
import Swal from "sweetalert2";

export default {
  data() {
    return {
      script: "",
      selectedTone: "formal", // Default tone
      selectedLevel: "easy", // Default tone
      selectedSetting: "office", // Default settin
      isRecording: false,
      audioBlob: null,
      audioUrl: null,
      feedback: {},
      CircleProgress,
      highlightedOriginal: [], // Array to hold highlighted original script words
      highlightedUser: [],     // Array to hold highlighted user words
    };
  },
  methods: {
    // Show a toast notification
    showToast(type, message, options = {}) {
      const toast = useToast();
      if (type === "success") {
        toast.success(message, options);
      } else if (type === "error") {
        toast.error(message, options);
      } else if (type === "info") {
        toast.info(message, options);
      }
    },

    // Update toast (useful for progress-like behavior)
    updateToast(toastId, message, options = {}) {
      const toast = useToast();
      toast.update(toastId, {
        ...options,
        content: message,
      });
    },
    compareAndHighlight(original, user) {
      const dmp = new diff_match_patch();
      const diff = dmp.diff_main(original, user);
      dmp.diff_cleanupSemantic(diff);

      const originalWords = [];
      const userWords = [];

      diff.forEach(([operation, text]) => {
        if (operation === 0) {
          // No changes
          originalWords.push(`<span>${text}</span>`);
          userWords.push(`<span>${text}</span>`);
        } else if (operation === -1) {
          // Missing words
          originalWords.push(`<span class="bg-yellow-300 text-black">${text}</span>`);
        } else if (operation === 1) {
          // Extra words
          userWords.push(`<span class="bg-red-300 text-white">${text}</span>`);
        }
      });

      this.highlightedOriginal = originalWords;
      this.highlightedUser = userWords;
    },
    highlightDifferences() {
      const dmp = new diff_match_patch();
      const diff = dmp.diff_main(this.feedback.transcription, this.script);
      dmp.diff_cleanupSemantic(diff);

      const userParts = [];

      diff.forEach(([operation, text]) => {
        if (operation === 0) {
          // Correct words (green)
          userParts.push(`<span style="color: green;">${text}</span>`);
        } else if (operation === -1) {
          // Missing words (indicated in original but not in user text)
          userParts.push(
            `<span style="color: red; text-decoration: line-through;">${text}</span>`
          );
        } else if (operation === 1) {
          // Extra words (red)
          userParts.push(`<span style="color: red;">${text}</span>`);
        }
      });

      // Assign formatted user transcription to `highlightedUser`
      this.highlightedUser = userParts.join("");
    },


    getWordClass(word) {
      // Helper function to normalize a word: remove punctuation, convert to lowercase
      const normalizeWord = (input) =>
        input.replace(/[.,'"/#!$%^&*;:{}=\-_`~()]/g, "").toLowerCase().trim();

      // Normalize transcription and fluency metrics
      const fluencyMetrics = JSON.parse(JSON.stringify(this.feedback.fluency_metrics));
      const normalizedExtraWords = fluencyMetrics.extra_words.map(normalizeWord);

      // Track occurrences for proper ordering of extra words
      if (!this.extraWordIndex) this.extraWordIndex = {}; // Tracks usage of extra words

      const normalizedCurrentWord = normalizeWord(word);

      // Check for extra words (mispronunciations) while maintaining order and frequency
      const extraIndex = normalizedExtraWords.indexOf(normalizedCurrentWord);
      if (
        extraIndex !== -1 &&
        (!this.extraWordIndex[normalizedCurrentWord] ||
          this.extraWordIndex[normalizedCurrentWord] <
          normalizedExtraWords.filter((w) => w === normalizedCurrentWord).length)
      ) {
        // Increment usage count
        this.extraWordIndex[normalizedCurrentWord] = (this.extraWordIndex[normalizedCurrentWord] || 0) + 1;
        return "bg-yellow-300 text-black"; // Highlight as extra/mispronounced
      }

      return ""; // No class for correct words
    },


    async generateScript() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {

          Swal.fire({
            icon: "error",
            title: "Unauthorized",
            text: "You are not authorized. Please log in.",
          });
          return;
        }
        Swal.fire({
          title: "Generating Script...",
          text: "Please wait while the script is being generated.",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        const formData = new FormData();
        formData.append("tone", this.selectedTone);
        formData.append("difficulty", this.selectedLevel);

        const response = await fetch("http://localhost:3000/generate-script", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const data = await response.json();
        if (data.script) {
          this.script = data.script; // Update the generated script
          Swal.fire({
            icon: "success",
            title: "Script Generated",
            text: "Your script has been successfully generated.",
          });
        } else {
          console.error("Failed to generate script:", data.error);
          Swal.fire({
            icon: "error",
            title: "Failed to Generate Script",
            text: data.error || "An error occurred while generating the script.",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while generating the script: " + error.message,
        });
      }
    },
    async toggleRecording() {
      if (!this.isRecording) {
        Swal.fire({
          title: "Recording...",
          text: "Your voice recording is in progress. Click 'Stop' to finish.",
          showCancelButton: true,
          confirmButtonText: "Stop",
          allowOutsideClick: false,
          didOpen: async () => {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            const chunks = [];
            this.mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
            this.mediaRecorder.onstop = () => {
              this.audioBlob = new Blob(chunks, { type: "audio/wav" });
              this.audioUrl = URL.createObjectURL(this.audioBlob);
            };
            this.mediaRecorder.start();
            this.isRecording = true;
          },
        }).then((result) => {
          if (result.isConfirmed && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            Swal.fire({
              icon: "success",
              title: "Recording Stopped",
              text: "Your voice recording has been saved.",
            });
          }
        });
      }
    },
    async evaluateRecording() {
      const formData = new FormData();
      formData.append("script", this.script);
      formData.append("audio", this.audioBlob, "recording.wav");

      try {
        const response = await fetch("http://localhost:3000/evaluate", {
          method: "POST",
          body: formData,
        });
        this.feedback = await response.json();
        console.log("Feedback received from API:", this.feedback);
        console.log("Missing Words:", this.feedback.fluency_metrics.missing_words);
        console.log("Extra Words:", this.feedback.fluency_metrics.extra_words);
        const fluencyMetrics = JSON.parse(JSON.stringify(this.feedback.fluency_metrics));
        console.log("Missing Words:", fluencyMetrics.missing_words);
        console.log("Extra Words:", fluencyMetrics.extra_words);

        if (Array.isArray(this.feedback.fluency_metrics.missingWords)) {
          console.log("Missing Words:");
          this.feedback.fluency_metrics.missingWords.forEach((word, index) => {
            console.log(`Word ${index + 1}: ${word}`);
          });
        } else {
          console.error("missingWords is not an array.");
        }

        // Loop through and log extraWords
        if (Array.isArray(this.feedback.fluency_metrics.extraWords)) {
          console.log("Extra Words:");
          this.feedback.fluency_metrics.extraWords.forEach((word, index) => {
            console.log(`Word ${index + 1}: ${word}`);
          });
        } else {
          console.error("extraWords is not an array.");
        }
        console.log("script:", this.script);
        console.log("user script:", this.feedback.transcription);
        this.highlightDifferences();
        // if (this.feedback.transcription) {
        //   this.compareAndHighlight(this.script, this.feedback.transcription);
        // }
        this.resetTracking(); // Reset tracking for new evaluation
      } catch (error) {
        console.error("Error:", error);
      }
    },
  },
  computed: {
    structuredFeedback() {
      if (this.feedback.feedback && typeof this.feedback.feedback === "string") {
        // Split the feedback by sections using "**Header:**" as a delimiter
        const sections = this.feedback.feedback.split("\n\n");
        const structured = [];

        sections.forEach((section) => {
          const parts = section.split(":");
          if (parts.length > 1) {
            const header = parts[0].trim(); // Header is before the colon
            const content = parts.slice(1).join(":").trim(); // Content is after the colon
            const items = content
              .split(".")
              .map((item) => item.trim())
              .filter((item) => item.length > 0);
            structured.push({ header, items });
          }
        });

        return structured;
      }

      return []; // Return empty array if no feedback exists
    },
  }

};

</script>
