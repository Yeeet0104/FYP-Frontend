import { createMemoryHistory, createRouter } from 'vue-router';
import MockInterview from '@/components/MockInterview.vue';
import LoginUser from '@/components/LoginUser.vue';
import RegisterUser from '@/components/RegisterUser.vue';
import ScriptRecording from '@/components/ScriptRecording.vue';
import QuestionGeneration from '@/components/questionGeneration.vue';


const routes = [
  { path: '/login', component: LoginUser },
  { path: '/register', component: RegisterUser },
  { path: '/mock-interview', component: MockInterview, meta: { requiresAuth: true } },
  { path: '/Speaking', component: ScriptRecording, meta: { requiresAuth: true } },
  { path: '/practice-test', component: QuestionGeneration, meta: { requiresAuth: true } }
];

const router = createRouter({
    history: createMemoryHistory(),
    routes,
  })

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token');
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router;
