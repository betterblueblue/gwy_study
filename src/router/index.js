import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue')
    },
    {
      path: '/practice',
      name: 'practice',
      component: () => import('../views/Practice.vue')
    },
    {
      path: '/study-plan',
      name: 'study-plan',
      component: () => import('../views/StudyPlan.vue')
    },
    {
      path: '/mistakes',
      name: 'mistakes',
      component: () => import('../views/Mistakes.vue')
    },
    {
      path: '/notes',
      name: 'notes',
      component: () => import('../views/Notes.vue')
    }
  ]
})

export default router