import { createRouter, createWebHistory } from 'vue-router'

// 管理员权限验证
const requireAdmin = (to, from, next) => {
  const isAdmin = localStorage.getItem('isAdmin')
  if (isAdmin) {
    next()
  } else {
    next('/')
  }
}

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
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/Admin.vue'),
      beforeEnter: requireAdmin
    }
  ]
})

export default router