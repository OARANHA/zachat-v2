import Vue from 'vue'
import VueRouter from 'vue-router'
import { Notify } from 'quasar'

import routes from './routes'

// Ajuste para desativar error por navegação duplicada
// https://github.com/vuejs/vue-router/issues/2881#issuecomment-520554378
// const originalPush = VueRouter.prototype.push
// VueRouter.prototype.push = function push (location, onResolve, onReject) {
//   if (onResolve || onReject) { return originalPush.call(this, location, onResolve, onReject) }
//   return originalPush.call(this, location).catch((err) => {
//     if (VueRouter.isNavigationFailure(err)) {
//       // resolve err
//       return err
//     }
//     // rethrow error
//     return Promise.reject(err)
//   })
// }

Vue.use(VueRouter)

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

const Router = new VueRouter({
  scrollBehavior: () => ({ x: 0, y: 0 }),
  routes,
  // Leave these as they are and change in quasar.conf.js instead!
  // quasar.conf.js -> build -> vueRouterMode
  // quasar.conf.js -> build -> publicPath
  mode: process.env.VUE_ROUTER_MODE,
  base: process.env.VUE_ROUTER_BASE
})

const whiteListName = [
  'login'
]

Router.beforeEach((to, from, next) => {
  let token
  try {
    const raw = localStorage.getItem('token')
    token = typeof raw === 'string' ? JSON.parse(raw) : raw
  } catch (e) {
    console.error('router token parse error:', e, localStorage.getItem('token'))
    token = null
  }

  if (!token) {
    if (whiteListName.indexOf(to.name) == -1) {
      if (to.fullPath !== '/login' && !to.query.tokenSetup) {
        Notify.create({ message: 'Necessário realizar login', position: 'top' })
        next({ name: 'login' })
      } else {
        next()
      }
    } else {
      next()
    }
  } else {
    next()
  }
})

Router.afterEach(to => {
  window.scrollTo(0, 0)
})

export default Router
