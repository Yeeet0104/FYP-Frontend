<template>
  <div class="h-full overflow-y-auto">
    <!-- Tabs Navigation -->
    <div class="mt-4 bg-gray-200 p-1.5 rounded-lg">
      <nav class="flex justify-center space-x-4">
        <button @click="setActiveTab('generate')"
          :class="activeTab === 'generate' ? 'bg-white text-black' : 'text-gray-500 hover:bg-gray-300'"
          class="py-2 flex-grow text-base font-medium rounded-lg transition-colors duration-200">
          Generate Questions
        </button>
        <button @click="setActiveTab('favorites')"
          :class="activeTab === 'favorites' ? 'bg-white text-black' : 'text-gray-500 hover:bg-gray-300'"
          class="py-2 flex-grow text-base font-medium rounded-lg transition-colors duration-200">
          Favorites
        </button>
        <button @click="setActiveTab('history')"
          :class="activeTab === 'history' ? 'bg-white text-black' : 'text-gray-500 hover:bg-gray-300'"
          class="py-2 flex-grow text-base font-medium rounded-lg transition-colors duration-200">
          History
        </button>
      </nav>
    </div>

    <!-- Generate Questions Content -->
    <div v-if="activeTab === 'generate'">
      <h2 class="text-2xl mt-2 text-gray-900 font-semibold">Generate Questions</h2>
      <!-- Loading Overlay -->
      <div v-if="isLoading" class="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
          <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
          <p class="text-gray-700 text-lg font-semibold">Generating Questions...</p>
          <p class="text-gray-500 text-sm mt-2">This may take a few moments</p>
        </div>
      </div>

      <!-- Check Gramamr Loading Overlay -->
      <div v-if="isCheckingGrammar"
        class="fixed inset-0 bg-gray-800 bg-opacity-70 z-50 flex items-center justify-center">
        <div class="bg-white p-6 rounded-xl shadow-xl flex flex-col items-center">
          <div class="loader-grammar mb-4"></div>
          <p class="text-gray-900 font-semibold text-lg">Checking Grammar...</p>
          <p class="text-gray-600 text-sm mt-2">Please wait while we review your answer.</p>
        </div>
      </div>

      <!-- Loading Overlay for Evaluation -->
      <div v-if="isEvaluating" class="fixed inset-0 bg-gray-800 bg-opacity-70 z-50 flex items-center justify-center">
        <div class="bg-white p-6 rounded-xl shadow-xl flex flex-col items-center">
          <div class="loader-evaluation mb-4"></div>
          <p class="text-gray-900 font-semibold text-lg">Evaluating Answer...</p>
        </div>
      </div>

      <div class="rounded-lg p-3 mt-6 bg-gray-200 text-white border-2 border-gray-300">

        <!-- File Upload Section -->
        <div class="flex-row p-3 font-semibold my-5 ml-6">
          <label for="file-upload"
            class="custom-file-upload rounded-lg text-black px-4 py-2 cursor-pointer border-2 border-black hover:bg-gray-400 mr-5">
            <i class="fa-solid fa-file-arrow-up text-xl mr-2"></i>
            Upload New Notes
          </label>
          <input id="file-upload" type="file" @change="handleFileUpload" class="hidden" />
          <span class="ml-5 border-2 px-4 py-2 rounded-lg bg-black text-white">{{ message
            }}</span>
          <span v-if="uploadedFile && !showExtraFileUpload" @click="showExtraFileUpload = true"
            class="ml-5 text-black cursor-pointer underline"> Add Extra Notes? </span>
        </div>

        <!-- Extra File Upload Section -->
        <div v-if="showExtraFileUpload" class="flex-row p-3 font-semibold my-5 ml-6">
          <label for="extra-file-upload"
            class="custom-file-upload rounded-lg text-black px-4 py-2 cursor-pointer border-2 border-black hover:bg-gray-400 mr-5">
            <i class="fa-solid fa-file-arrow-up text-xl mr-2"></i>
            Upload Extra Notes
          </label>
          <input id="extra-file-upload" type="file" @change="handleExtraFileUpload" class="hidden" />
          <span class="ml-5 border-2 px-4 py-2 rounded-lg text-white border bg-black">
            {{ extraUploadedFile ? `Extra File Uploaded: ${extraUploadedFile.name}` : "No file uploaded yet." }}
          </span>
        </div>
        <div>
        </div>

        <!-- Question Options -->
        <div class="grid grid-cols-3 font-semibold ml-8 text-black">
          <div class="m-2 flex">
            <div>
              <h2>Question Type</h2>
              <select v-model="questionType" :disabled="isGenerated" class="p-2 rounded-lg border border-black my-2">
                <option v-for="(type, index) in questionTypes" :key="index" :value="type">{{ type }}</option>
              </select>
            </div>
          </div>
          <div class="m-2 ml-20">
            <h2>Bloom's Taxonomy Level</h2>
            <select v-model="bloomLevel" :disabled="isGenerated"
              class="text-gray-900 p-2 rounded-lg border border-black my-2">
              <option v-for="(level, index) in bloomLevels" :key="index" :value="level">{{ level }}</option>
            </select>
          </div>
          <div class="m-2">
            <h2>Number of Questions</h2>
            <select v-model="numQuestions" :disabled="isGenerated"
              class="text-gray-900 p-2 rounded-lg border border-black my-2">
              <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
            </select>
          </div>
        </div>
        <div class="ml-10 mt-6">
          <label class="text-black font-semibold">
            <input type="checkbox" v-model="includeUseCase" style="width: 15px; height: 15px;" />
            Include Scenario
          </label>
        </div>

        <!-- Generate and Reset Buttons -->
        <div class="my-8 mr-24 flex justify-end">
          <button v-if="!isGenerated" class="rounded-md bg-black text-white px-6 py-2 text-sm font-semibold"
            @click="submitForm">Generate</button>
          <button v-else class="rounded-md bg-black text-white px-6 py-2 text-sm font-semibold" @click="resetForm">
            Re-Generate </button>
        </div>

        <!-- Scenario Case 1 Box -->
        <div v-if="useCase1 && questionType === 'Short Answer'"
          class="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 mb-8 border border-blue-200">
          <div class="flex items-center gap-2 mb-3">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 class="font-semibold text-blue-900">Case Scenario</h3>
          </div>
          <p class="text-blue-800 leading-relaxed">{{ useCase1 }}</p>
        </div>

        <!-- Questions for First File -->
        <div v-if="questionsForFile1.length > 0 && questionType === 'Short Answer'" class="max-w-4xl mx-auto mt-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">{{ numQuestions }} Questions Generated for {{ message }}
          </h2>

          <div class="space-y-6">
            <div v-for="(question, index) in questionsForFile1" :key="index"
              class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <!-- Question Header -->
              <div class="bg-gray-800 p-4 flex items-center justify-between">
                <p class="text-white font-medium flex-1">{{ question }}</p>
                <button @click="toggleIcon(1, index)" class="ml-4 text-white hover:text-blue-400 transition-colors">
                  <i class="text-xl"
                    :class="isBookmark1[index] ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark'"></i>
                </button>
              </div>

              <!-- Answer Section -->
              <div class="p-4 space-y-4">
                <textarea v-model="userAnswerFile1[index]"
                  class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] text-gray-900"
                  placeholder="Type your answer here...">
                </textarea>

                <!-- Feedback Display -->
                <div v-if="grammarFeedback[index]"
                  class="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
                  {{ grammarFeedback[index] }}
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-3">
                  <button @click="checkGrammar(index)"
                    class="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-colors">
                    Check Grammar
                  </button>
                  <button @click="toggleAnswer(index)"
                    class="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium transition-colors">
                    Check Answer
                  </button>
                </div>

                <!-- Answer Evaluation -->
                <div v-if="answersEvaluation[index]"
                  class="mt-4 rounded-lg border-l-4 border-green-500 bg-green-50 p-4">
                  <p class="text-green-700">{{ answersEvaluation[index] }}</p>

                  <div v-if="userAnswerScore[index] !== 'Correct'" class="mt-4 pt-4 border-t border-green-200">
                    <p class="font-semibold text-gray-900">Suggested Answer:</p>
                    <p class="mt-2 text-gray-700">{{ suggestedAnswers1[index] }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Scenario Case 2 Box -->
        <div v-if="useCase2 && questionType === 'Short Answer'"
          class="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl mt-10 p-6 mb-8 border border-blue-200">
          <div class="flex items-center gap-2 mb-3">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 class="font-semibold text-blue-900">Case Scenario</h3>
          </div>
          <p class="text-blue-800 leading-relaxed">{{ useCase2 }}</p>
        </div>

        <!-- Questions for Second File -->
        <div v-if="questionsForFile2.length > 0 && questionType === 'Short Answer'" class="max-w-4xl mx-auto mt-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">{{ numQuestions }} Questions Generated for {{
            extraUploadedFile.name }}
          </h2>

          <div class="space-y-6">
            <div v-for="(question, index) in questionsForFile2" :key="index"
              class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <!-- Question Header -->
              <div class="bg-gray-800 p-4 flex items-center justify-between">
                <p class="text-white font-medium flex-1">{{ question }}</p>
                <button @click="toggleIcon(2, index)" class="ml-4 text-white hover:text-blue-400 transition-colors">
                  <i class="text-xl"
                    :class="isBookmark2[index] ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark'"></i>
                </button>
              </div>

              <!-- Answer Section -->
              <div class="p-4 space-y-4">
                <textarea v-model="userAnswerFile2[index]"
                  class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] text-gray-900"
                  placeholder="Type your answer here...">
                </textarea>

                <!-- Feedback Display -->
                <div v-if="grammarFeedback2[index]"
                  class="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
                  {{ grammarFeedback2[index] }}
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-3">
                  <button @click="checkGrammar(index)"
                    class="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-colors">
                    Check Grammar
                  </button>
                  <button @click="toggleAnswer(index)"
                    class="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium transition-colors">
                    Check Answer
                  </button>
                </div>

                <!-- Answer Evaluation -->
                <div v-if="answersEvaluation2[index]"
                  class="mt-4 rounded-lg border-l-4 border-green-500 bg-green-50 p-4">
                  <p class="text-green-700">{{ answersEvaluation2[index] }}</p>

                  <div v-if="userAnswerScore2[index] !== 'Correct'" class="mt-4 pt-4 border-t border-green-200">
                    <p class="font-semibold text-gray-900">Suggested Answer:</p>
                    <p class="mt-2 text-gray-700">{{ suggestedAnswers2[index] }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end" v-if="isGenerated && questionType === 'Short Answer'">
          <button class="rounded-md bg-black text-white mr-14 px-6 py-2 text-sm font-semibold"
            @click="saveQuestionsAndAnswers" :disabled="!allInputsFilled">Save</button>
        </div>

        <!-- Scenario Case 1 Box -->
        <div v-if="useCase1 && questionType === 'Multiple Choice Questions (MCQ)'"
          class="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 mb-8 border border-blue-200">
          <div class="flex items-center gap-2 mb-3">
            <i class="fas fa-book-open text-blue-600"></i>
            <h3 class="font-semibold text-blue-900">Case Scenario</h3>
          </div>
          <p class="text-blue-800 leading-relaxed">{{ useCase1 }}</p>
        </div>

        <!-- MCQ Questions -->
        <div v-if="questionsForFile1.length > 0 && questionType === 'Multiple Choice Questions (MCQ)'" class="mt-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">{{ numQuestions }} Questions Generated for {{ message }}</h2>

          <div class="space-y-8">
            <div v-for="(question, index) in questionsForFile1" :key="index"
              class="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
              <!-- Question Header -->
              <div class="p-4 bg-gray-50 border-b border-gray-200">
                <div class="flex items-start gap-3">
                  <span
                    class="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full font-medium">
                    Q{{ index + 1 }}
                  </span>
                  <h3 class="text-gray-800 font-medium">{{ question }}</h3>
                </div>
              </div>

              <!-- Options Grid -->
              <div class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div v-for="(option, optIndex) in mcqOptionsForFile1[index]" :key="optIndex" class="relative">
                    <label
                      class="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200">
                      <input type="radio" :name="'file1-question-' + index" :value="option"
                        v-model="userMCQAnswerFile1[index]" class="hidden">
                      <span class="flex items-center justify-center w-8 h-8 rounded-full border-2 mr-3 
                  text-sm font-medium bg-white border-blue-500 text-blue-500">
                        {{ String.fromCharCode(65 + optIndex) }}
                      </span>
                      <span class="text-gray-700">{{ option }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Scenario Case 2 Box -->
        <div v-if="useCase2 && questionType === 'Multiple Choice Questions (MCQ)'"
          class="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 my-8 border border-blue-200">
          <div class="flex items-center gap-2 mb-3">
            <i class="fas fa-book-open text-blue-600"></i>
            <h3 class="font-semibold text-blue-900">Case Scenario</h3>
          </div>
          <p class="text-blue-800 leading-relaxed">{{ useCase2 }}</p>
        </div>

        <!-- MCQ Questions -->
        <div v-if="questionsForFile2.length > 0 && questionType === 'Multiple Choice Questions (MCQ)'" class="mt-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">{{ numQuestions }} Questions Generated for {{
            extraUploadedFile.name }}</h2>

          <div class="space-y-8">
            <div v-for="(question, index) in questionsForFile2" :key="index"
              class="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
              <!-- Question Header -->
              <div class="p-4 bg-gray-50 border-b border-gray-200">
                <div class="flex items-start gap-3">
                  <span
                    class="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full font-medium">
                    Q{{ index + 1 }}
                  </span>
                  <h3 class="text-gray-800 font-medium">{{ question }}</h3>
                </div>
              </div>

              <!-- Options Grid -->
              <div class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div v-for="(option, optIndex) in mcqOptionsForFile2[index]" :key="optIndex" class="relative">
                    <label
                      class="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200">
                      <input type="radio" :name="'file1-question-' + index" :value="option"
                        v-model="userMCQAnswerFile2[index]" class="hidden">
                      <span class="flex items-center justify-center w-8 h-8 rounded-full border-2 mr-3 
                  text-sm font-medium bg-white border-blue-500 text-blue-500">
                        {{ String.fromCharCode(65 + optIndex) }}
                      </span>
                      <span class="text-gray-700">{{ option }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Results Box -->
        <div v-if="resultsVisible" class="results-box">
          <h2>Quiz Results</h2>
          <p :class="feedbackClass">
            {{ feedbackMessage }}
          </p>
          <p v-if="extraUploadedFile" class="text-gray-500">
            <strong>Score:</strong> {{ mcqScoreFile1 + mcqScoreFile2 }} out of {{ questionsForFile1.length +
              questionsForFile2.length }}
          </p>
          <p v-else class="text-gray-500">
            <strong>Score:</strong> {{ mcqScoreFile1 }} out of {{ questionsForFile1.length }}
          </p>
          <div class="flex flex-col items-center mt-4">
            <button @click="resetQuiz" class="retry-button rounded-xl px-8 py-2">Retake Quiz</button>
            <button v-if="allAnswersCorrect" @click="saveQuiz" class="rounded-xl bg-black px-10 py-2 mt-4">Save
              Quiz</button>
          </div>
        </div>

        <!-- Mark MCQ Button -->
        <div v-if="checkAnsBtnVisible && questionsForFile1.length > 0" class="mt-5 flex justify-end">
          <button class="rounded-lg bg-black text-white px-5 py-2 mb-2 mr-5 text-sm font-semibold"
            @click="checkMCQAns">Check Answers</button>
        </div>
      </div>
    </div>

    <!-- Favorites Content -->
    <div v-if="activeTab === 'favorites'" class="max-w-4xl mx-auto p-4">
      <h2 class="text-2xl font-bold text-gray-900 mb-6"><i class="fa-regular fa-star mr-2"></i>Favorites</h2>

      <div v-if="favorites.length === 0" class="bg-gray-50 rounded-lg p-8 text-center">
        <i class="fa-regular fa-bookmark text-3xl text-gray-400 mb-3"></i>
        <p class="text-gray-600">No favorite questions yet</p>
      </div>

      <div v-else class="space-y-6">
        <div v-for="(favorite, index) in favorites" :key="favorite.question_id"
          class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <!-- Case Scenario if exists -->
          <div v-if="favorite.case_scenario" class="bg-blue-50 p-4 border-b border-blue-100">
            <div class="flex items-center gap-2 mb-2">
              <i class="fas fa-book-open text-blue-600"></i>
              <h3 class="font-semibold text-blue-900">Case Scenario</h3>
            </div>
            <p class="text-blue-800">{{ favorite.case_scenario }}</p>
          </div>

          <!-- Question -->
          <div class="bg-gray-800 p-4">
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white rounded-full">
                <span class="text-gray-800 font-medium">Q{{ index + 1 }}</span>
              </div>
              <p class="text-white font-medium flex-1">{{ favorite.question_text }}</p>
              <button @click="removeFavorite(favorite.question_id)"
                class="text-yellow-400 hover:text-yellow-300 transition-colors">
                <i class="fas fa-star text-xl"></i>
              </button>
            </div>
          </div>

          <!-- Answer -->
          <div class="p-6">
            <div class="flex items-center gap-2 mb-3">
              <i class="fas fa-check-circle text-green-600"></i>
              <h4 class="font-medium text-gray-900">Answer</h4>
            </div>
            <p class="text-gray-700 pl-6">{{ favorite.answer_text }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- History Content -->
    <div v-if="activeTab === 'history'" class="bg-gray-50">
      <div class="max-w-4xl mx-auto p-4">
        <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <i class="fa-solid fa-clock-rotate-left mr-3 text-gray-800"></i>History
        </h2>

        <div class="space-y-4">
          <div v-for="dateGroup in history" :key="dateGroup.date" class="rounded-xl overflow-hidden shadow-sm">
            <!-- Date Header -->
            <button @click="toggleDate(dateGroup.date)"
              class="w-full flex justify-between items-center p-4 bg-gray-800 text-white hover:bg-gray-700 transition-colors duration-200">
              <span class="font-medium flex items-center">
                <i class="fa-regular fa-calendar-days text-2xl mr-3 text-blue-400"></i>
                {{ dateGroup.date }}
              </span>
              <svg
                :class="['w-5 h-5 transform transition-transform text-blue-400', activeDate === dateGroup.date ? 'rotate-180' : '']"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M19 9l-7 7-7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>

            <!-- Questions Container -->
            <div v-show="activeDate === dateGroup.date" class="bg-white divide-y divide-gray-100">
              <div v-for="group in dateGroup.groups" :key="group.generationId"
                class="p-6 space-y-4 hover:bg-gray-50 transition-colors">
                <!-- Generation ID -->
                <div class="flex items-center gap-3">
                  <span class="px-4 py-1.5 bg-gray-800 text-white rounded-full text-sm font-medium">
                    ID: {{ group.generationId }}
                  </span>
                  <span class="text-gray-500 text-sm">{{ new Date(dateGroup.date).toLocaleTimeString() }}</span>
                </div>

                <!-- Use Case -->
                <div v-if="group.questions[0]?.useCase" class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <h3 class="font-semibold text-blue-900 mb-2">Use Case</h3>
                  <p class="text-blue-800">{{ group.questions[0].useCase }}</p>
                </div>

                <!-- Questions List -->
                <div class="space-y-4 mt-6">
                  <div v-for="(question, index) in group.questions" :key="index"
                    class="rounded-lg border-l-4 border-gray-800 bg-gray-50 p-4 hover:shadow-md transition-all">
                    <div class="flex items-start gap-4">
                      <span
                        class="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-800 text-white rounded-full font-medium">
                        {{ index + 1 }}
                      </span>
                      <div class="flex-1 space-y-3">
                        <p class="text-gray-900 font-medium">{{ question.questionText }}</p>
                        <div class="pl-4 border-l-2 border-blue-300 bg-white p-3 rounded">
                          <p class="text-gray-700">{{ question.answerText }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import axios from 'axios';
import { useToast } from "vue-toastification"
import { v4 as uuidv4 } from 'uuid';

export default {
  data() {
    return {
      history: [],
      activeDate: null,
      activeTab: 'generate',
      message: "Notes",
      uploadedFile: null,
      extraUploadedFile: null,
      questionsForFile1: [],
      questionsForFile2: [],
      userAnswerFile1: [],
      userAnswerFile2: [],
      answersFile1: [],
      answersFile2: [],
      mcqOptionsForFile1: [],
      mcqOptionsForFile2: [],
      mcqAnswersForFile1: [],
      mcqAnswersForFile2: [],
      userMCQAnswerFile1: [],
      userMCQAnswerFile2: [],
      mcqScoreFile1: 0,
      mcqScoreFile2: 0,
      questionType: 'Short Answer',
      questionTypes: [
        'Short Answer',
        'Multiple Choice Questions (MCQ)'
      ],
      numQuestions: 1,
      bloomLevel: 'Remembering',
      bloomLevels: [
        'Remembering',
        'Understanding',
        'Applying',
        'Analyzing',
        'Evaluating',
        'Creating'
      ],
      isGenerated: false,
      showExtraFileUpload: false,
      errorMessage: [],
      grammarFeedback: [],
      grammarFeedback2: [],
      showAnswer: [],
      isBookmark1: [],
      isBookmark2: [],
      favorites: [],
      isLoading: false,
      isCheckingGrammar: false,
      feedbackMessage: "",
      feedbackClass: "",
      resultsVisible: false,
      checkAnsBtnVisible: true,
      includeUseCase: false,
      useCase1: "",
      useCase2: "",
      answersEvaluation: [],
      isEvaluating: false,
      userAnswerScore: [],
      answersEvaluation2: [],
      userAnswerScore2: [],
      storeQuestion1: [],
      storeQuestion2: [],
      bloomLevelAchieved: [],
      bloomLevelAchieved2: [],
      suggestedAnswers1: [],
      suggestedAnswers2: []
    };
  },
  computed: {
    allInputsFilled() {
      const allFilled = (arr) => arr.length > 0 && arr.every(input => input.trim() !== '');

      // Check if either of the answer files have been uploaded
      if (this.extraUploadedFile) {
        // Check if both userAnswerFile1 and userAnswerFile2 have non-empty entries
        return allFilled(this.userAnswerFile1) && allFilled(this.userAnswerFile2);
      } else {
        // Only check if userAnswerFile1 has non-empty entries
        return allFilled(this.userAnswerFile1);
      }
    },
    allAnswersCorrect() {
      const totalQuestions = this.questionsForFile1.length + (this.questionsForFile2?.length || 0);
      const totalScore = this.mcqScoreFile1 + this.mcqScoreFile2;
      return totalScore === totalQuestions;
    }
  }
  ,
  methods: {
    setActiveTab(tab) {
      this.activeTab = tab;
      if (tab === 'favorites') {
        this.fetchFavorites();
      }
    },
    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.uploadedFile = file;
        this.message = `File Uploaded: ${file.name}`;
        event.target.value = null; // Reset the input field
      } else {
        this.message = "No file selected.";
      }
    },
    async handleExtraFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.extraUploadedFile = file;
        event.target.value = null; // Reset the input field
      } else {
        console.log("No extra file selected.");
      }
    },
    async submitForm() {
      if (this.uploadedFile) {
        this.isLoading = true;
        this.checkAnsBtnVisible = true;
        const formData = new FormData();
        formData.append('file', this.uploadedFile);

        if (this.extraUploadedFile) {
          formData.append('extraFile', this.extraUploadedFile);
        }
        formData.append('numQuestions', this.numQuestions);
        formData.append('bloomLevel', this.bloomLevel);
        formData.append('questionType', this.questionType);
        formData.append('includeUseCase', this.includeUseCase);

        try {
          const response = await axios.post('http://localhost:8003/generate-questions', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });

          // Parse the response data
          if (response && response.data) {
            console.log('Response data:', response.data);
            if (this.questionType === 'Multiple Choice Questions (MCQ)') {
              let currentQuestion1 = null;
              let currentOptions1 = [];

              // Check if it's a single file or multiple files
              if (response.data.questions) {
                // Single file processing
                response.data.questions.forEach((item) => {
                  if (item.match(/^\d+\./)) {
                    if (currentQuestion1) {
                      this.questionsForFile1.push(currentQuestion1.text);
                      this.storeQuestion1.push(currentQuestion1);
                      this.mcqOptionsForFile1.push(currentOptions1);
                    }
                    currentQuestion1 = {
                      questionId: uuidv4(),
                      text: item.trim()
                    };
                    currentOptions1 = [];
                  } else if (item.startsWith('Answer:')) {
                    this.mcqAnswersForFile1.push(item.replace('Answer: ', '').trim());
                  } else if (item.match(/^Use Case:/i)) {
                    const useCase = item.replace(/^Use Case:\s*/i, "").trim();
                    this.useCase1 = useCase;
                  } else if (item.match(/^\*\*Use Case:\*\*/i)) {
                    const useCase = item.replace(/^\*\*Use Case:\*\*\s*/i, "").trim();
                    this.useCase1 = useCase;
                  }else {
                    const option = item.replace(/^[A-D][).]\s*/, '');
                    currentOptions1.push(option);
                  }
                });
                if (currentQuestion1) {
                  this.questionsForFile1.push(currentQuestion1.text);
                  this.storeQuestion1.push(currentQuestion1);
                  this.mcqOptionsForFile1.push(currentOptions1);
                }
              } else if (response.data.questions_file1 && response.data.questions_file2) {
                // Multiple files processing

                // Process questions for file 1
                let currentQuestion1 = null;
                let currentOptions1 = [];
                response.data.questions_file1.forEach((item) => {
                  if (item.match(/^\d+\./)) {
                    if (currentQuestion1) {
                      this.questionsForFile1.push(currentQuestion1.text);
                      this.storeQuestion1.push(currentQuestion1);
                      this.mcqOptionsForFile1.push(currentOptions1);
                    }
                    currentQuestion1 = {
                      questionId: uuidv4(),
                      text: item.trim()
                    };
                    currentOptions1 = [];
                  } else if (item.startsWith('Answer:')) {
                    this.mcqAnswersForFile1.push(item.replace('Answer: ', '').trim());
                  } else if (item.match(/^Use Case:/i)) {
                    const useCase = item.replace(/^Use Case:\s*/i, "").trim();
                    this.useCase1 = useCase;
                  } else if (item.match(/^\*\*Use Case:\*\*/i)) {
                    const useCase = item.replace(/^\*\*Use Case:\*\*\s*/i, "").trim();
                    this.useCase1 = useCase;
                  }else {
                    const option = item.replace(/^[A-D][).]\s*/, '');
                    currentOptions1.push(option);
                  }
                });
                if (currentQuestion1) {
                  this.questionsForFile1.push(currentQuestion1.text);
                  this.storeQuestion1.push(currentQuestion1);
                  this.mcqOptionsForFile1.push(currentOptions1);
                }

                // Process questions for file 2
                let currentQuestion2 = null;
                let currentOptions2 = [];
                response.data.questions_file2.forEach((item) => {
                  if (item.match(/^\d+\./)) {
                    if (currentQuestion2) {
                      this.questionsForFile2.push(currentQuestion2.text);
                      this.storeQuestion2.push(currentQuestion2);
                      this.mcqOptionsForFile2.push(currentOptions2);
                    }
                    currentQuestion2 = {
                      questionId: uuidv4(),
                      text: item.trim()
                    };
                    currentOptions2 = [];
                  } else if (item.startsWith('Answer:')) {
                    this.mcqAnswersForFile2.push(item.replace('Answer: ', '').trim());
                  } else if (item.match(/^Use Case:/i)) {
                    const useCase = item.replace(/^Use Case:\s*/i, "").trim();
                    this.useCase2 = useCase;
                  }else if (item.match(/^\*\*Use Case:\*\*/i)) {
                    const useCase = item.replace(/^\*\*Use Case:\*\*\s*/i, "").trim();
                    this.useCase2 = useCase;
                  } else {
                    const option = item.replace(/^[A-D][).]\s*/, '');
                    currentOptions2.push(option);
                  }
                });
                if (currentQuestion2) {
                  this.questionsForFile2.push(currentQuestion2.text);
                  this.storeQuestion2.push(currentQuestion2);
                  this.mcqOptionsForFile2.push(currentOptions2);
                }
              }
            }
            else {
              this.checkAnsBtnVisible = false;
              // For short answer questions
              if (this.extraUploadedFile) {
                // Process questions and answers for the first file
                this.questionsForFile1 = [];
                this.answersFile1 = [];

                response.data.questions_file1.forEach((item) => {
                  const match = item.match(/^(\d+)\.\s*(.*)/i); // Match questions starting with a number
                  if (match) {
                    const question = {
                      questionId: uuidv4(),
                      text: match[0].trim()
                    };
                    this.questionsForFile1.push(question.text); // Add question
                    this.storeQuestion1.push(question);
                    this.answersFile1.push(""); // No answer available yet
                  } else if (item.match(/^Answer:/i)) {
                    const answer = item.replace(/^Answer:\s*/i, "").trim();
                    if (this.answersFile1.length > 0) {
                      this.answersFile1[this.answersFile1.length - 1] = answer; // Assign answer to the latest question
                    }
                  } else if (item.match(/^Use Case:/i)) {
                    const useCase = item.replace(/^Use Case:\s*/i, "").trim();
                    this.useCase1 = useCase;
                  }else if (item.match(/^\*\*Use Case:\*\*/i)) {
                    const useCase = item.replace(/^\*\*Use Case:\*\*\s*/i, "").trim();
                    this.useCase1 = useCase;
                  }
                });

                // Process questions and answers for the second file
                this.questionsForFile2 = [];
                this.answersFile2 = [];

                response.data.questions_file2.forEach((item) => {
                  const match = item.match(/^(\d+)\.\s*(.*)/i); // Match questions starting with a number
                  if (match) {
                    const question = {
                      questionId: uuidv4(),
                      text: match[0].trim()
                    };
                    this.questionsForFile2.push(question.text); // Add question
                    this.storeQuestion2.push(question);
                    this.answersFile2.push(""); // No answer available yet
                  } else if (item.match(/^Answer:/i)) {
                    const answer = item.replace(/^Answer:\s*/i, "").trim();
                    if (this.answersFile2.length > 0) {
                      this.answersFile2[this.answersFile2.length - 1] = answer; // Assign answer to the latest question
                    }
                  } else if (item.match(/^Use Case:/i)) {
                    const useCase = item.replace(/^Use Case:\s*/i, "").trim();
                    this.useCase2 = useCase;
                  }else if (item.match(/^\*\*Use Case:\*\*/i)) {
                    const useCase = item.replace(/^\*\*Use Case:\*\*\s*/i, "").trim();
                    this.useCase2 = useCase;
                  }
                });
              } else {
                // Process questions and answers for a single file
                this.questionsForFile1 = [];
                this.answersFile1 = [];

                response.data.questions.forEach((item) => {
                  const match = item.match(/^(\d+)\.\s*(.*)/i); // Match questions starting with a number
                  if (match) {
                    const question = {
                      questionId: uuidv4(),
                      text: match[0].trim()
                    };
                    this.questionsForFile1.push(question.text); // Add question
                    this.storeQuestion1.push(question);
                    this.answersFile1.push(""); // No answer available yet
                  } else if (item.match(/^Answer:/i)) {
                    const answer = item.replace(/^Answer:\s*/i, "").trim();
                    if (this.answersFile1.length > 0) {
                      this.answersFile1[this.answersFile1.length - 1] = answer; // Assign answer to the latest question
                    }
                  } else if (item.match(/^Use Case:/i)) {
                    const useCase = item.replace(/^Use Case:\s*/i, "").trim();
                    this.useCase1 = useCase;
                  } else if (item.match(/^\*\*Use Case:\*\*/i)) {
                    const useCase = item.replace(/^\*\*Use Case:\*\*\s*/i, "").trim();
                    this.useCase1 = useCase;
                  }
                });
              }
            }
            this.isGenerated = true;
          }
        } catch (error) {
          // Handle validation or other errors
          if (error.response && error.response.data) {
            console.error("Validation Error:", error.response.data);
            // Optionally, show an alert or message to the user
            alert("There was a validation error. Please check your input.");
          }
        } finally {
          this.isLoading = false;
        }
      } else {
        this.message = "No file selected.";
      }
    },
    async resetForm() {
      // Reset all data properties to their initial state
      this.message = "Upload A File";
      this.extraUploadedFile = null;
      this.uploadedFile = null;
      this.questionsForFile1 = [];
      this.questionsForFile2 = [];
      this.userAnswerFile1 = [];
      this.userAnswerFile2 = [];
      this.answersFile1 = [];
      this.answersFile2 = [];
      this.mcqOptionsForFile1 = [];
      this.mcqOptionsForFile2 = [];
      this.mcqAnswersForFile1 = [];
      this.mcqAnswersForFile2 = [];
      this.userMCQAnswerFile1 = [];
      this.userMCQAnswerFile2 = [];
      this.mcqScoreFile1 = 0;
      this.mcqScoreFile2 = 0;
      this.questionType = 'Short Answer';
      this.numQuestions = 1;
      this.bloomLevel = 'Remembering';
      this.isGenerated = false;
      this.showExtraFileUpload = false;
      this.errorMessage = [];
      this.grammarFeedback = [];
      this.grammarFeedback2 = [];
      this.showAnswer = [];
      this.isBookmark1 = [];
      this.isBookmark2 = [];
      this.favorites = [];
      this.isLoading = false;
      this.isCheckingGrammar = false;
      this.feedbackMessage = "";
      this.feedbackClass = "";
      this.resultsVisible = false;
      this.checkAnsBtnVisible = true;
      this.includeUseCase = false;
      this.isEvaluating = false;
      this.useCase1 = "";
      this.useCase2 = "";
      this.answersEvaluation = [];
      this.userAnswerScore = [];
      this.answersEvaluation2 = [];
      this.userAnswerScore2 = [];
      this.storeQuestion1 = [];
      this.storeQuestion2 = [];
      this.bloomLevelAchieved = [];
      this.bloomLevelAchieved2 = [];
      this.suggestedAnswers1 = [];
      this.suggestedAnswers2 = [];
    },
    async checkGrammar(index) {
      this.isCheckingGrammar = true;
      // Check if answers are valid before sending to the backend
      try {
        const userAnswer = this.userAnswerFile1[index];
        const userAnswer2 = this.extraUploadedFile ? this.userAnswerFile2[index] : null;

        const response = await axios.post('http://localhost:8001/check-grammar', {
          userAnswerFile1: userAnswer,
          userAnswerFile2: userAnswer2
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const feedback = response.data.feedback;
        const feedback2 = response.data.feedback2;
        this.grammarFeedback[index] = feedback;
        this.grammarFeedback2[index] = feedback2;
      } catch (error) {
        console.error('Error checking grammar:', error);
        alert('Error checking grammar: ' + error.message);
      } finally {
        this.isCheckingGrammar = false;
      }
    },
    async checkAnswer(index, fileIndex) {
      try {
        let userAnswer, response, feedback;
        if (fileIndex === 1) {
          userAnswer = this.userAnswerFile1[index];
          response = await axios.post('http://localhost:8003/check-cognitive-level', {
            userAnswer: userAnswer,
            bloomLevel: this.bloomLevel
          }, {
            headers: {
              'Content-Type': 'application/json'
            }
          });

          feedback = response.data.feedback.match(/Feedback:\s*(Yes|A little|No)/i)[1];
          this.bloomLevelAchieved[index] = feedback;
        }
        else if (fileIndex === 2) {
          userAnswer = this.userAnswerFile2[index];
          response = await axios.post('http://localhost:8003/check-cognitive-level', {
            userAnswer: userAnswer,
            bloomLevel: this.bloomLevel
          }, {
            headers: {
              'Content-Type': 'application/json'
            }
          });

          feedback = response.data.feedback.match(/Feedback:\s*(Yes|A little|No)/i)[1];
          this.bloomLevelAchieved2[index] = feedback;
        }

        if ((fileIndex === 1 && feedback === 'No') || (fileIndex === 2 && feedback === 'No')) {
          const toast = useToast();
          toast.error('Cognitive level not achieved. Please retry.');
        } else if ((fileIndex === 1 && feedback === 'Yes') || (fileIndex === 1 && feedback === 'A little') || (fileIndex === 2 && feedback === 'Yes') || (fileIndex === 2 && feedback === 'A little')) {
          this.isEvaluating = true;
          this.toggleAnswer(index, fileIndex);
        }

      } catch (error) {
        console.error('Error checking cognitive level:', error);
        alert('Error checking cognitive level: ' + error.message);
      }
    },
    async toggleAnswer(index) {
      this.isEvaluating = true;
      try {
        const requestBody = {};

        // Add file 1 data if it exists
        if (this.questionsForFile1?.[index] && this.userAnswerFile1?.[index]) {
          requestBody.questionsForFile1 = this.questionsForFile1[index];
          requestBody.userAnswerFile1 = this.userAnswerFile1[index];
          requestBody.useCase1 = this.useCase1 || '';
        }

        // Add file 2 data if it exists
        if (this.questionsForFile2?.[index] && this.userAnswerFile2?.[index]) {
          requestBody.questionsForFile2 = this.questionsForFile2[index];
          requestBody.userAnswerFile2 = this.userAnswerFile2[index];
          requestBody.useCase2 = this.useCase2 || '';
        }

        // Check if we have any data to send
        if (Object.keys(requestBody).length === 0) {
          throw new Error('Please provide an answer before evaluating');
        }

        console.log('Sending request to evaluate answer:', requestBody);

        // Post request to the backend for answer evaluation
        const response = await axios.post('http://localhost:8002/evaluate-answer', requestBody, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log('Received evaluation response:', response.data);

        if (response.data.evaluation) {
          // Extract the evaluation content
          const evaluation = response.data.evaluation;
          const evaluationContent = evaluation.replace(/^Evaluation:\s*/, '').trim();

          // Find the position of "Suggested Answer:" and extract content up to that point
          const suggestedAnswerIndex = evaluationContent.search(/Suggested Answer:/i);
          const finalEvaluationContent = suggestedAnswerIndex !== -1
            ? evaluationContent.substring(0, suggestedAnswerIndex).trim()
            : evaluationContent;

          this.answersEvaluation[index] = finalEvaluationContent;
          const scoreMatch = evaluation.match(/Score:\s*(\w+)/);

          const suggestedAnswerMatch = evaluation.match(/Suggested Answer:\s*(.*)/i);

          if (suggestedAnswerMatch && suggestedAnswerMatch[1]) {
            this.suggestedAnswers1[index] = suggestedAnswerMatch[1].trim();
          }

          if (scoreMatch) {
            const score = scoreMatch[1];
            this.userAnswerScore[index] = score;
          }
        }

        if (response.data.evaluation2) {
          // Extract the evaluation content
          const evaluation2 = response.data.evaluation2;
          const evaluationContent2 = evaluation2.replace(/^Evaluation:\s*/, '').trim();

          // Find the position of "Suggested Answer:" and extract content up to that point
          const suggestedAnswerIndex2 = evaluationContent2.search(/Suggested Answer:/i);
          const finalEvaluationContent2 = suggestedAnswerIndex2 !== -1
            ? evaluationContent2.substring(0, suggestedAnswerIndex2).trim()
            : evaluationContent2;

          this.answersEvaluation2[index] = finalEvaluationContent2;

          const scoreMatch2 = evaluation2.match(/Score:\s*(\w+)/);

          const suggestedAnswerMatch2 = evaluation2.match(/Suggested Answer:\s*(.*)/i);

          if (suggestedAnswerMatch2 && suggestedAnswerMatch2[1]) {
            this.suggestedAnswers2[index] = suggestedAnswerMatch2[1].trim();
          }

          if (scoreMatch2) {
            const score2 = scoreMatch2[1];
            this.userAnswerScore2[index] = score2;
          }
        }

      } catch (error) {
        console.error('Error evaluating answer:', error);
        alert('Error evaluating answer: ' + error.message);
      } finally {
        this.isEvaluating = false;
      }
    },
    selectOption(index, option) {
      this.$set(this.answers, index, option);
    },
    toggleIcon(fileIndex, index) {
      if (fileIndex === 1) {
        if (this.isBookmark1[index] === undefined) {
          this.isBookmark1[index] = false;
        }
        this.isBookmark1[index] = !this.isBookmark1[index];
        const toast = useToast();

        const question = this.questionsForFile1[index];
        const answer = this.userAnswerFile1[index] || 'No answer provided';
        const isFavorited = this.isBookmark1[index];
        const questionId = this.storeQuestion1[index].questionId; // Get the questionId

        // Update favorite status in the database
        const token = localStorage.getItem("token");
        axios.post('http://localhost:3000/update-favorite', {
          questionId,
          favorited: isFavorited
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).then(() => {
          if (isFavorited) {
            this.favorites.push({ question, answer });
            toast.success('Question saved');
          } else {
            this.favorites = this.favorites.filter(fav => fav.question !== question);
            toast.error('Question removed');
          }
        }).catch(error => {
          console.error('Error updating favorite status:', error.response ? error.response.data : error.message);
          toast.error('Failed to update favorite status');
        });
      } else if (fileIndex === 2) {
        if (this.isBookmark2[index] === undefined) {
          this.isBookmark2[index] = false;
        }
        this.isBookmark2[index] = !this.isBookmark2[index];
        const toast = useToast();

        const question = this.questionsForFile2[index];
        const answer = this.userAnswerFile2[index] || 'No answer provided';
        const isFavorited = this.isBookmark2[index];
        const questionId = this.storeQuestion2[index].questionId; // Get the questionId

        // Update favorite status in the database
        const token = localStorage.getItem("token");
        axios.post('http://localhost:3000/update-favorite', {
          questionId,
          favorited: isFavorited
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).then(() => {
          if (isFavorited) {
            this.favorites.push({ question, answer });
            toast.success('Question saved');
          } else {
            this.favorites = this.favorites.filter(fav => fav.question !== question);
            toast.error('Question removed');
          }
        }).catch(error => {
          console.error('Error updating favorite status:', error.response ? error.response.data : error.message);
          toast.error('Failed to update favorite status');
        });
      }
    },
    async updateFavoriteStatus(questionId, favorited) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          "http://localhost:3000/update-favorite", // Adjust endpoint as needed
          { questionId, favorited },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Favorited status updated:", response.data);
        const toast = useToast();
        if (favorited) {
          toast.success("Question favourited");
        } else {
          toast.error("Question removed from favourites");
        }
      } catch (error) {
        console.error(
          "Error updating favorited status:",
          error.response ? error.response.data : error.message
        );
      }
    },
    checkMCQAns() {
      this.mcqScoreFile1 = 0;
      this.mcqScoreFile2 = 0;
      console.log(this.userMCQAnswerFile1);
      console.log(this.userMCQAnswerFile2);

      const allAnswered1 = this.questionsForFile1.every((_, index) => {
        return this.userMCQAnswerFile1[index] !== null &&
          this.userMCQAnswerFile1[index] !== undefined &&
          this.userMCQAnswerFile1[index] !== "";
      });

      const allAnswered2 = this.extraUploadedFile
        ? this.questionsForFile2.every((_, index) => {
          return this.userMCQAnswerFile2[index] !== null &&
            this.userMCQAnswerFile2[index] !== undefined &&
            this.userMCQAnswerFile2[index] !== "";
        })
        : true;

      if (!allAnswered1 || !allAnswered2) {
        const toast = useToast();
        toast.warning("Please answer all questions before checking!");
        this.checkAnsBtnVisible = true;
        return;
      }
      else {
        const cleanAnswer = (answer) => {
          return (answer || "").replace(/^[A-Z]\)\s*/, ''); // Removes letter, closing bracket, and space
        };

        // Compare user answers with correct answers
        this.mcqAnswersForFile1.forEach((correctAnswer, index) => {
          const cleanedUserAnswer = cleanAnswer(this.userMCQAnswerFile1[index]);
          const cleanedCorrectAnswer = cleanAnswer(correctAnswer);

          if (cleanedUserAnswer === cleanedCorrectAnswer) {
            this.mcqScoreFile1++;
          }
        });

        if (this.extraUploadedFile) {
          this.mcqAnswersForFile2.forEach((correctAnswer, index) => {
            const cleanedUserAnswer = cleanAnswer(this.userMCQAnswerFile2[index]);
            const cleanedCorrectAnswer = cleanAnswer(correctAnswer);

            if (cleanedUserAnswer === cleanedCorrectAnswer) {
              this.mcqScoreFile2++;
            }
          });
        }

        // Calculate performance feedback
        const totalQuestions = this.questionsForFile1.length + (this.questionsForFile2?.length || 0);
        const totalScore = this.mcqScoreFile1 + this.mcqScoreFile2;
        const percentage = (totalScore / totalQuestions) * 100;
        if (percentage >= 80) {
          this.feedbackMessage = "Excellent job! 🌟";
          this.feedbackClass = "success";
        } else if (percentage >= 50) {
          this.feedbackMessage = "Good effort! Keep practising! 💪";
          this.feedbackClass = "warning";
        } else {
          this.feedbackMessage = "Don't worry, try again! 🚀";
          this.feedbackClass = "error";
        }

        // Show results box
        this.resultsVisible = true;
        this.checkAnsBtnVisible = false;
      }
    },
    resetQuiz() {
      this.userMCQAnswerFile1 = [];
      this.resultsVisible = false;
      this.mcqScoreFile1 = 0;
      this.feedbackMessage = "";
      this.feedbackClass = "";
      this.checkAnsBtnVisible = true;
      this.userMCQAnswerFile2 = [];
      this.mcqScoreFile2 = 0;
    },
    async saveQuestionsAndAnswers() {
      try {
        const token = localStorage.getItem("token");

        // Save file 1 questions
        const questionsAndAnswersFile1 = this.questionsForFile1.map((question, index) => ({
          questionId: this.storeQuestion1[index].questionId,
          question,
          answer: this.userAnswerFile1[index],
          caseScenario: this.useCase1 || null
        }));

        await axios.post('http://localhost:3000/save-questions-and-answers', {
          questionsAndAnswers: questionsAndAnswersFile1
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const toast = useToast();
        toast.success('File 1 questions saved successfully');

        // Save file 2 questions if exists
        if (this.extraUploadedFile) {
          const questionsAndAnswersFile2 = this.questionsForFile2.map((question, index) => ({
            questionId: this.storeQuestion2[index].questionId,
            question,
            answer: this.userAnswerFile2[index],
            caseScenario: this.useCase2 || null
          }));

          await axios.post('http://localhost:3000/save-questions-and-answers', {
            questionsAndAnswers: questionsAndAnswersFile2
          }, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          toast.success('File 2 questions saved successfully');
        }
      } catch (error) {
        console.error('Error:', error.response?.data || error.message);
      }
    },
    async fetchQuestions() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("Token is missing.");
          return;
        }

        const response = await axios.get(
          "http://localhost:3000/fetch-questions",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Transform the data directly into the required format
        this.history = Object.entries(response.data.groupedQuestions).map(([date, groups]) => ({
          date: new Date(date).toLocaleDateString(),
          groups: Object.entries(groups).map(([generationId, questions]) => ({
            generationId,
            questions: questions.map(item => ({
              questionText: item.questionText,
              answerText: item.answerText,
              useCase: item.useCase
            }))
          }))
        }));

        console.log("Fetched history:", this.history);
      } catch (error) {
        console.error(
          "Error fetching questions:",
          error.response ? error.response.data : error.message
        );
      }
    },
    async fetchFavorites() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get('http://localhost:3000/fetch-favorites', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        this.favorites = response.data.favorites;
      } catch (error) {
        console.error('Error fetching favorite questions:', error.response ? error.response.data : error.message);
      }
    },
    async removeFavorite(questionId) {
      try {
        const token = localStorage.getItem("token");
        await axios.post('http://localhost:3000/update-favorite', {
          questionId,
          favorited: false
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        this.favorites = this.favorites.filter(fav => fav.question_id !== questionId);
        const toast = useToast();
        toast.success('Question removed from favorites');
      } catch (error) {
        console.error('Error removing favorite:', error.response ? error.response.data : error.message);
        const toast = useToast();
        toast.error('Failed to remove favorite');
      }
    },
    toggleDate(date) {
      this.activeDate = this.activeDate === date ? null : date;
    },
    async saveQuiz() {
      try {
        const token = localStorage.getItem("token");

        // Save MCQ questions and answers for file 1
        const mcqQuestionsAndAnswersFile1 = this.questionsForFile1.map((question, index) => ({
          questionId: this.storeQuestion1[index].questionId,
          question,
          answer: this.mcqAnswersForFile1[index],
          caseScenario: this.useCase1 || null
        }));

        await axios.post('http://localhost:3000/save-questions-and-answers', {
          questionsAndAnswers: mcqQuestionsAndAnswersFile1
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const toast = useToast();
        toast.success('File 1 MCQ questions saved successfully');

        // Save MCQ questions and answers for file 2 if exists
        if (this.extraUploadedFile) {
          const mcqQuestionsAndAnswersFile2 = this.questionsForFile2.map((question, index) => ({
            questionId: this.storeQuestion2[index].questionId,
            question,
            answer: this.mcqAnswersForFile2[index],
            caseScenario: this.useCase2 || null
          }));

          await axios.post('http://localhost:3000/save-questions-and-answers', {
            questionsAndAnswers: mcqQuestionsAndAnswersFile2
          }, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          toast.success('File 2 MCQ questions saved successfully');
        }
      } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        const toast = useToast();
        toast.error('Failed to save MCQ questions');
      }
    }
  },
  created() {
    this.fetchQuestions();
  },
};

</script>

<style>
input[type="radio"]:checked+span {
  @apply bg-blue-500 text-white border-blue-500;
}

input[type="radio"]:checked+span+span {
  @apply text-black;
}

label:hover span:first-of-type {
  @apply border-blue-400;
}

.custom-radio {
  display: inline-block;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  text-align: center;
  line-height: 1.25rem;
  font-weight: bold;
  color: rgb(133, 131, 131);
  background-color: white;
  cursor: pointer;
}

input[type="radio"]:checked+.custom-radio {
  background-color: #4bf758;
  color: white;
}

.loader-evaluation {
  border: 4px solid #e0e0e0;
  /* Light grey */
  border-top: 4px solid #3498db;
  /* Blue */
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.loader-grammar {
  border: 4px solid #e0e0e0;
  /* Light grey */
  border-top: 4px solid #10b981;
  /* Green */
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}


.results-box {
  margin-top: 20px;
  padding: 20px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.results-box h2 {
  margin-bottom: 15px;
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.results-box p {
  font-size: 18px;
  margin: 10px 0;
  line-height: 1.6;
}

.results-box p.success {
  color: #2ecc71;
  font-weight: bold;
}

.results-box p.warning {
  color: #f39c12;
  font-weight: bold;
}

.results-box p.error {
  color: #e74c3c;
  font-weight: bold;
}

.retry-button {
  margin-top: 15px;
  font-size: 16px;
  border: none;
  border-radius: 25px;
  background: #3498db;
  color: white;
  cursor: pointer;
}

.retry-button:hover {
  background: #2980b9;
}
</style>