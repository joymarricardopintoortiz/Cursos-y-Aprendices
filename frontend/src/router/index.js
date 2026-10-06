import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AuthLayout from '../layouts/AuthLayout.vue'
import MainLayout from '../layouts/MainLayout.vue'

const routes = [
  {
    path: '/login',
    component: AuthLayout,
    meta: { public: true },
    children: [
      { path: '', name: 'login', component: () => import('../views/LoginView.vue') },
    ],
  },
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', name: 'home', component: () => import('../views/HomeView.vue') },
      { path: 'cursos', name: 'cursos', component: () => import('../views/CursosView.vue') },
      { path: 'aprendices', name: 'aprendices', component: () => import('../views/AprendicesView.vue') },
      {
        path: 'usuarios',
        name: 'usuarios',
        component: () => import('../views/UsuariosView.vue'),
        meta: { admin: true },
      },
      { path: ':pathMatch(.*)*', name: 'notfound', component: () => import('../views/NotFoundView.vue') },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.public) return auth.token ? { path: '/' } : true
  if (!auth.token) return { path: '/login' }
  if (to.meta.admin && !auth.esAdmin) return { path: '/' }
  return true
})

export default router