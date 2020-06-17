import Vue from 'vue'
import VueRouter from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css';
import Home from '../views/Home.vue'
import Watch from '../views/Watch.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/watch/:path(.*)',
    name: 'Watch',
    component: Watch
  },
  {
    path: '*',
    name: 'SubDir',
    component: Home,
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
})

router.beforeEach((to, from, next) => {
  if (to.name === 'SubDir' || to.name === 'Watch') document.title = [...to.path.split(/[\\/]/)].pop()
  else document.title = to.name
  next()
})


router.beforeResolve((to, from, next) => {
  if (to.name) NProgress.start()
  next()
})

router.afterEach((to, from) => {
  NProgress.done()
})


export default router
