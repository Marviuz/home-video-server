import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import Watch from '@/views/Watch.vue';
import Home from '../views/Home.vue';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/watch',
    name: 'Watch',
    component: Watch,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
