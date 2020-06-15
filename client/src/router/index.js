import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Watch from '../views/Watch.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Animes',
    component: Home
  },
  {
    path: '/watch',
    name: 'Watch',
    component: Watch
  }
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
  document.title = to.name
  if (to.name === 'Watch') document.title += ` ${to.query.src.split(/[\\\/]/g).pop()}`
  next()
})

export default router
