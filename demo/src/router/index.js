

import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)

const originalPush = Router.prototype.push
Router.prototype.push = function push (location) {
  return originalPush.call(this, location).catch(error => error)
}

const routes = [
  {
    path: '/', redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/home/index'),
  },
  // {
  //   path: '/server',
  //   name: 'Server',
  //   component: () => import('../views/server/index'),
  // },
  {
    path: '*', // 兜底，重定向路径
    redirect: '/'
  }

];

// const allRoutes = routes.concat([]);

const router = new Router({
  mode: 'history',
  routes
})
// router.beforeEach((to, from, next) => {
// })
export default router
