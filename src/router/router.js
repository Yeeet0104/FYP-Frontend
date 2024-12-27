import { createWebHistory, createRouter } from 'vue-router'; // Change createMemoryHistory to createWebHistory
import MockInterview from '@/components/MockInterview.vue';
import LoginUser from '@/components/LoginUser.vue';
import RegisterUser from '@/components/RegisterUser.vue';
import ScriptRecording from '@/components/ScriptRecording.vue';
import QuestionGeneration from '@/components/questionGeneration.vue';
import FoldersPage from '@/components/FoldersPage.vue';
import ChapterPage from '@/components/ChapterPage.vue';
import TreeDiagramPage from '@/components/TreeDiagramPage.vue';
import TreeDiagram from '@/components/TreeDiagram.vue';
import axios from 'axios';

const routes = [
  { path: '/login', component: LoginUser },
  { path: '/register', component: RegisterUser },
  { path: '/mock-interview', component: MockInterview, meta: { requiresAuth: true } },
  { path: '/speaking', component: ScriptRecording, meta: { requiresAuth: true } },
  { path: '/question-generation', component: QuestionGeneration, meta: { requiresAuth: true } },
  { path: "/notes", component: FoldersPage, meta: { requiresAuth: true } },
  { path: "/folders/:folderId/chapters", component: ChapterPage, meta: { requiresAuth: true } },
  { path: "/chapters/:chapterId/tree", component: TreeDiagramPage, meta: { requiresAuth: true } },
  { path: "/TreeDiagram", component: TreeDiagram, meta: { requiresAuth: true } }
];

const router = createRouter({
  history: createWebHistory(), // Use createWebHistory for proper navigation
  routes,
});

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem("token");

  if (to.meta.requiresAuth) {
    if (!token) {
      next("/login");
    } else {
      try {
        const response = await axios.post("http://localhost:3000/validate-token", { token });

        if (response.data.valid) {
          next();
        } else {
          console.warn("Invalid or expired token, redirecting to login");
          next("/login");
        }
      } catch (error) {
        console.error("Error validating token, redirecting to login");
        next("/login");
      }
    }
  } else {
    next();
  }
});


export default router;
