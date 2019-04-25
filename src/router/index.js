import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Templates from '@/components/Templates'
import SignIn from '@/components/Auth/SignIn'
// import SignInSuccess from '@/components/Auth/SignInSuccess'
import SignUp from '@/components/Auth/SignUp'
import About from '@/components/About'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/templates',
      name: 'templates',
      component: Templates
    },
    /* {
      path: '/signin-success',
      name: 'signin-success',
      component: SignInSuccess
    }, */
    {
      path: '/signin',
      name: 'signin',
      component: SignIn
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignUp
    },
    {
      path: '/about',
      name: 'about',
      component: About
    }
  ]
})
