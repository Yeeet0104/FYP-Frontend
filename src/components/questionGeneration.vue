<template>
  <div>
    <h1 class="text-2xl text-gray-900 font-semibold">Generate your Questions</h1>

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
        <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
        <p class="text-gray-700 text-lg font-semibold">Generating Questions...</p>
        <p class="text-gray-500 text-sm mt-2">This may take a few moments</p>
      </div>
    </div>

    <!-- Check Gramamr Loading Overlay -->
    <div v-if="isCheckingGrammar" class="fixed inset-0 bg-gray-800 bg-opacity-70 z-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-xl shadow-xl flex flex-col items-center">
        <div class="loader-grammar mb-4"></div>
        <p class="text-gray-900 font-semibold text-lg">Checking Grammar...</p>
        <p class="text-gray-600 text-sm mt-2">Please wait while we review your answer.</p>
      </div>
    </div>


    <div class="border-2 border-black rounded-xl p-3 mt-4 text-white bg-gray-800">

      <!-- File Upload Section -->
      <div class="flex-row p-3 font-semibold my-5 ml-6">
        <label for="file-upload" class="custom-file-upload rounded-3xl bg-gray-800 text-white px-4 py-2 cursor-pointer border-2 border-gray-200 hover:bg-white hover:text-gray-800 mr-5">
          Upload New Notes
        </label>
        <input id="file-upload" type="file" @change="handleFileUpload" class="hidden"/>
        <span class="ml-5 border-2 px-4 py-2 rounded-3xl bg-white text-gray-600 border-2" style="border-color: #6366f1;">{{ message }}</span>
        <span v-if="uploadedFile && !showExtraFileUpload" @click="showExtraFileUpload = true" class="ml-5 text-blue-500 cursor-pointer underline" > Add Extra Notes? </span>
      </div>

      <!-- Extra File Upload Section -->
      <div v-if="showExtraFileUpload" class="flex-row p-3 font-semibold my-5 ml-6">
        <label for="extra-file-upload" class="custom-file-upload rounded-3xl bg-gray-800 text-white px-4 py-2 cursor-pointer border-2 border-gray-200 hover:bg-white hover:text-gray-800 mr-5">
          Upload Extra Notes
        </label>
        <input id="extra-file-upload" type="file" @change="handleExtraFileUpload" class="hidden"/>
        <span
          class="ml-5 border-2 px-4 py-2 rounded-3xl bg-white text-gray-600 border-2" style="border-color: #6366f1;">
          {{ extraUploadedFile ? `Extra File Uploaded: ${extraUploadedFile.name}` : "No file uploaded yet." }}
        </span>
      </div>

      <!-- Question Options -->
      <div class="grid grid-cols-3 font-semibold ml-8">
        <div class="m-2 flex">
          <div>
            <h2>Question Type</h2>
            <select v-model="questionType" :disabled="isGenerated" class="text-gray-900 p-2 rounded-3xl my-2">
              <option v-for="(type, index) in questionTypes" :key="index" :value="type">{{ type }}</option>
            </select>
          </div>
          <div class="m-5 mt-10">
            <label class="text-sm font-thin">
              <input type="checkbox" v-model="includeUseCase"/>
              Include Use Case
            </label>       
          </div>
        </div>
        <div class="m-2 ml-20"> 
          <h2>Bloom's Taxonomy Level</h2>
          <select v-model="bloomLevel" :disabled="isGenerated" class="text-gray-900 p-2 rounded-3xl my-2">
            <option v-for="(level, index) in bloomLevels" :key="index" :value="level">{{ level }}</option>
          </select>
        </div>
        <div class="m-2">
          <h2>Number of Questions</h2>
          <select v-model="numQuestions" :disabled="isGenerated" class="text-gray-900 p-2 rounded-3xl my-2">
            <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>
      </div>

      <!-- Generate and Reset Buttons -->
      <div class="my-8 mr-24 flex justify-end">
        <button v-if="!isGenerated" class="rounded-3xl bg-white text-gray-900 px-6 py-2 text-sm font-semibold" @click="submitForm">Generate</button>
        <button v-else class="rounded-3xl bg-red-500 text-white px-6 py-2 text-sm font-semibold" @click="resetForm" > Re-Generate </button>
      </div>

      <!-- Use Case 1 Box -->
      <div v-if="useCase1" class="use-case-box rounded-xl p-4 my-4 bg-blue-100 text-blue-900">
        <h3 class="font-bold text-lg mb-2">Use Case</h3>
        <p>{{ useCase1 }}</p>
      </div>

      <!-- Questions for First File -->
      <div v-if="questionsForFile1.length > 0 && questionType === 'Short Answer'" style="margin-top: 20px;">
        <h2>{{ numQuestions }} Questions Generated for {{ message }}</h2>
        <ul>
          <li v-for="(question, index) in questionsForFile1" :key="index">
            <div class="rounded-2xl p-3 my-8 bg-gray-700 text-white">
              <div class="flex items-center justify-between w-full">
                <p>{{ question }} </p>
                <i 
                  class="mr-5 text-xl"
                  :class="isBookmark[index] ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark'"
                  @click="toggleIcon(index)" 
                  style="cursor: pointer;"
                ></i>
              </div>              
              <textarea v-model="userAnswerFile1[index]" class="w-full p-2 mt-5 rounded text-black bg-gray-100" placeholder="Type your answer here..."></textarea>
              <div v-if="grammarFeedback[index]" class="mt-2 p-3 text-green">
                <p>{{ grammarFeedback[index] }}</p> 
              </div>
              <div class="flex flex-col items-start mt-4">
                <button class="rounded-sm bg-[#86c9e8] text-gray-900 px-2 py-2 mb-2 text-sm font-semibold" @click="checkGrammar(index)">Check Grammar</button>
                <button class="rounded-sm bg-[#ceefdd] text-gray-900 px-5 py-2 mt-2 text-sm font-semibold" @click="toggleAnswer(index)">
                  {{ showAnswer[index] ? 'Hide Answer' : 'See Answer' }}
                </button>
              </div>
              
              <!-- Display the suggested answer for the question -->
              <div v-if="showAnswer[index]" class="mt-4 p-3 text-green-500 bg-white rounded">
                <strong>Suggested Answer:</strong> {{ answersFile1[index] }}
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Questions for Second File -->
      <div v-if="questionsForFile2.length > 0 && questionType === 'Short Answer'" style="margin-top: 20px;">
        <h2>{{ numQuestions }} Questions Generated for {{ extraUploadedFile.name }}</h2>
        <ul>
          <li v-for="(question, index) in questionsForFile2" :key="index">
            <div class="rounded-2xl p-3 my-8 bg-gray-700 text-white">
              <div class="flex items-center justify-between w-full">
                <p>{{ question }} </p>
                <i 
                  class="mr-5 text-xl"
                  :class="isBookmark[index] ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark'"
                  @click="toggleIcon(index)" 
                  style="cursor: pointer;"
                ></i>
              </div>  
              <textarea v-model="userAnswerFile2[index]" class="w-full p-2 mt-5 rounded text-black bg-gray-100" placeholder="Type your answer here..."></textarea>
              <div v-if="grammarFeedback[index]" class="mt-2 p-3 text-green">
                <p>{{ grammarFeedback[index] }}</p> 
              </div>
              <div class="flex flex-col items-start mt-4">
                <button class="rounded-sm bg-[#86c9e8] text-gray-900 px-2 py-2 mb-2 text-sm font-semibold" @click="checkGrammar(index)">Check Grammar</button>
                <button class="rounded-sm bg-[#ceefdd] text-gray-900 px-5 py-2 mt-2 text-sm font-semibold" @click="toggleAnswer(index)">
                  {{ showAnswer[index] ? 'Hide Answer' : 'See Answer' }}
                </button>
              </div>

              <!-- Display the correct answer for the question -->
              <div v-if="showAnswer[index]" class="mt-4 p-3 text-green-500 bg-white rounded">
                <strong>Correct Answer:</strong> {{ answersFile1[index] }}
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- MCQ for First File -->
      <div v-if="questionsForFile1.length > 0 && questionType === 'Multiple Choice Questions (MCQ)'" style="margin-top: 20px;">
        <h2>{{ numQuestions }} Questions Generated for {{ message }}</h2>
        <ul>
          <li v-for="(question, index) in questionsForFile1" :key="index">
            <div class="rounded-2xl p-3 my-8 bg-gray-700 text-white">
              <h3>{{ question }}</h3>
              <ul class="grid grid-cols-2 gap-4 mt-4">
                <li v-for="(option, optIndex) in mcqOptionsForFile1[index]" :key="optIndex" class="col-span-1 flex items-center">
                  <label class="flex items-center">
                    <input type="radio" :name="'file1-question-' + index" :value="option" v-model="userMCQAnswerFile1[index]" class="hidden">
                    <span class="custom-radio mr-2">{{ String.fromCharCode(65 + optIndex) }}</span>
                    {{ option }}
                  </label>
                </li>
              </ul>
            </div>            
          </li>
        </ul>
      </div>

      <!-- MCQ for Second File -->
      <div v-if="questionsForFile2.length > 0 && questionType === 'Multiple Choice Questions (MCQ)'" style="margin-top: 20px;">
        <h2>{{ numQuestions }} Questions Generated for {{ extraUploadedFile.name }}</h2>
        <ul>
          <li v-for="(question, index) in questionsForFile2" :key="index">
            <div class="rounded-2xl p-3 my-8 bg-gray-700 text-white">
              <h3>{{ question }}</h3>
              <ul class="grid grid-cols-2 gap-4 mt-4">
                <li v-for="(option, optIndex) in mcqOptionsForFile2[index]" :key="optIndex" class="col-span-1 flex items-center">
                  <label class="flex items-center">
                    <input type="radio" :name="'file2-question-' + index" :value="option" v-model="userMCQAnswerFile2[index]" class="hidden">
                    <span class="custom-radio mr-2">{{ String.fromCharCode(65 + optIndex) }}</span>
                    {{ option }}
                  </label>
                </li>
              </ul>
            </div>            
          </li>
        </ul>
      </div>
      
      <!-- Results Box -->
      <div v-if="resultsVisible" class="results-box">
        <h2>Quiz Results</h2>
        <p :class="feedbackClass">
          {{ feedbackMessage }}
        </p>
        <p v-if="extraUploadedFile" class="text-gray-500">
          <strong>Score:</strong> {{ mcqScoreFile1 + mcqScoreFile2 }} out of {{ questionsForFile1.length + questionsForFile2.length }}
        </p>
        <p v-else class="text-gray-500">
          <strong>Score:</strong> {{ mcqScoreFile1 }} out of {{ questionsForFile1.length }}
        </p>
        <button @click="resetQuiz" class="retry-button">Retake Quiz</button>
      </div>

      <!-- Mark MCQ Button -->
      <div v-if="checkAnsBtnVisible && questionsForFile1.length > 0" class="mt-5 flex justify-end">
        <button class="rounded-sm bg-[#86c9e8] text-gray-900 px-2 py-2 mb-2 mr-5 text-sm font-semibold" @click="checkMCQAns">Check Answers</button>
      </div>

    </div>
  </div>
</template>

<script>
import axios from 'axios';
import {useToast} from "vue-toastification"

export default {
  data() {
    return {
      message: "Upload A File",
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
      showAnswer: [],
      isBookmark: [],
      isLoading: false,
      isCheckingGrammar: false,      
      feedbackMessage: "",
      feedbackClass: "",
      resultsVisible: false,
      checkAnsBtnVisible: true,
      includeUseCase: false,
      useCase1: "",
    };
  },methods: {
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
          const response = await axios.post('http://localhost:8000/generate-questions', formData, {
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
                    this.questionsForFile1.push(currentQuestion1);
                    this.mcqOptionsForFile1.push(currentOptions1);
                  }
                  currentQuestion1 = item;
                  currentOptions1 = [];
                } else if (item.startsWith('Answer:')) {
                  this.mcqAnswersForFile1.push(item.replace('Answer: ', '').trim());
                } else {
                  const option = item.replace(/^[A-D][).]\s*/, '');
                  currentOptions1.push(option);
                }
              });
              if (currentQuestion1) {
                this.questionsForFile1.push(currentQuestion1);
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
                    this.questionsForFile1.push(currentQuestion1);
                    this.mcqOptionsForFile1.push(currentOptions1);
                  }
                  currentQuestion1 = item;
                  currentOptions1 = [];
                } else if (item.startsWith('Answer:')) {
                  this.mcqAnswersForFile1.push(item.replace('Answer: ', '').trim());
                } else {
                  const option = item.replace(/^[A-D][).]\s*/, '');
                  currentOptions1.push(option);
                }
              });
              if (currentQuestion1) {
                this.questionsForFile1.push(currentQuestion1);
                this.mcqOptionsForFile1.push(currentOptions1);
              }

              // Process questions for file 2
              let currentQuestion2 = null;
              let currentOptions2 = [];
              response.data.questions_file2.forEach((item) => {
                if (item.match(/^\d+\./)) {
                  if (currentQuestion2) {
                    this.questionsForFile2.push(currentQuestion2);
                    this.mcqOptionsForFile2.push(currentOptions2);
                  }
                  currentQuestion2 = item;
                  currentOptions2 = [];
                } else if (item.startsWith('Answer:')) {
                  this.mcqAnswersForFile2.push(item.replace('Answer: ', '').trim());
                } else {
                  const option = item.replace(/^[A-D][).]\s*/, '');
                  currentOptions2.push(option);
                }
              });
              if (currentQuestion2) {
                this.questionsForFile2.push(currentQuestion2);
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
                        const question = match[0].trim();
                        this.questionsForFile1.push(question); // Add question
                        this.answersFile1.push(""); // No answer available yet
                    } else if (item.match(/^Answer:/i)) {
                        const answer = item.replace(/^Answer:\s*/i, "").trim();
                        if (this.answersFile1.length > 0) {
                            this.answersFile1[this.answersFile1.length - 1] = answer; // Assign answer to the latest question
                        }
                    }
                });

                // Process questions and answers for the second file
                this.questionsForFile2 = [];
                this.answersFile2 = [];
                
                response.data.questions_file2.forEach((item) => {
                    const match = item.match(/^(\d+)\.\s*(.*)/i); // Match questions starting with a number
                    if (match) {
                        const question = match[0].trim();
                        this.questionsForFile2.push(question); // Add question
                        this.answersFile2.push(""); // No answer available yet
                    } else if (item.match(/^Answer:/i)) {
                        const answer = item.replace(/^Answer:\s*/i, "").trim();
                        if (this.answersFile2.length > 0) {
                            this.answersFile2[this.answersFile2.length - 1] = answer; // Assign answer to the latest question
                        }
                    }
                });
            } else {
                // Process questions and answers for a single file
                this.questionsForFile1 = [];
                this.answersFile1 = [];
                console.log('Response data:', response.data.questions);
                response.data.questions.forEach((item) => {
                    const match = item.match(/^(\d+)\.\s*(.*)/i); // Match questions starting with a number
                    if (match) {
                        const question = match[0].trim();
                        this.questionsForFile1.push(question); // Add question
                        this.answersFile1.push(""); // No answer available yet
                    } else if (item.match(/^Answer:/i)) {
                        const answer = item.replace(/^Answer:\s*/i, "").trim();
                        if (this.answersFile1.length > 0) {
                            this.answersFile1[this.answersFile1.length - 1] = answer; // Assign answer to the latest question
                        }
                    }else if(item.match(/^Use Case:/i)){
                      const useCase = item.replace(/^Use Case:\s*/i, "").trim();
                      this.useCase1 = useCase;
                    }
                });
                console.log('Answers:', this.answersFile1);
            }
       }
          this.isGenerated = true;
        }} catch (error) {
          console.error('Error uploading file:', error.response.data);

          // Handle validation or other errors
          if (error.response && error.response.data) {
            console.error("Validation Error:", error.response.data);
          // Optionally, show an alert or message to the user
            alert("There was a validation error. Please check your input.");
        }
      }finally{
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
      this.showAnswer = [];
      this.isBookmark = [];
      this.isLoading = false;
      this.isCheckingGrammar = false;
      this.feedbackMessage = "";
      this.feedbackClass = "";
      this.resultsVisible = false;
      this.checkAnsBtnVisible = true;
      this.includeUseCase = false;
      this.useCase1 = "";
    },
    async checkGrammar(index) {
      this.isCheckingGrammar = true;
      // Check if answers are valid before sending to the backend
        try {
          const userAnswer = this.userAnswerFile1[index];
          const userAnswer2 = this.userAnswerFile2[index];

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
          this.grammarFeedback[index] = feedback2;
        } catch (error) {
          console.error('Error checking grammar:', error);
          alert('Error checking grammar: ' + error.message);
        }finally{
          this.isCheckingGrammar = false;
        }
    },toggleAnswer(index) {
      this.showAnswer[index] = !this.showAnswer[index];
    },
    selectOption(index, option) {
      this.$set(this.answers, index, option);
    },
    toggleIcon(index) {
    if (this.isBookmark[index] === undefined) {
      this.isBookmark[index] = false;
    }
    this.isBookmark[index] = !this.isBookmark[index];
    
    const toast = useToast();

    if (this.isBookmark[index]) {
      toast.success('Question saved');
    }
    else{
      toast.error('Question removed');
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
  else{
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
}
};

</script>

<style>
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

input[type="radio"]:checked + .custom-radio {
  background-color: #4bf758;
  color: white;
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
  border: 4px solid #e0e0e0; /* Light grey */
  border-top: 4px solid #10b981; /* Green */
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
  padding: 10px 20px;
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