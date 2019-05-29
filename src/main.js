// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'

import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import 'firebase/messaging'
// import 'firebase/notifications'
// import 'firebase/storage'
import {config} from './helpers/firebaseConfig'

import Vuelidate from 'vuelidate'
// import TreeView from 'vue-json-tree-view'

Vue.use(Vuelidate)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>',
  created () {
    firebase.initializeApp(config)
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.$router.push('/')

        const FIREBASE_MESSAGING = firebase.messaging()
        const FIREBASE_DATABASE = firebase.database()
        // const FIREBASE_NOTIFICATIONS = firebase.notifications()
        FIREBASE_MESSAGING.usePublicVapidKey('BCcFXVYoeQk-AE5PWLAoZIjsKsSvZ6Jo-F0qL8HfvgcFLz7PVeHxXTbmCdD9x7kWecCBHKGq1Z9s05CqZpqW1Z0')
        navigator.serviceWorker.register('./static/js/firebase-messaging-sw.js')
          .then((registration) => {
            FIREBASE_MESSAGING.useServiceWorker(registration)
          }).then(() => {
            return FIREBASE_MESSAGING.requestPermission()
          }).then(() => {
            console.log('Notification permission granted.')
            return FIREBASE_MESSAGING.getToken()
          }).then(token => {
            console.log(token)
            return FIREBASE_MESSAGING.getToken().then((token) => {
              FIREBASE_DATABASE.ref(this.$store.getters.user.id + '/tokens').push({
                token: token
              })
            })
          }).catch(err => {
            console.log(err)
          })
        FIREBASE_MESSAGING.onMessage(function (payload) {
          console.log('Message received. ', payload)
        })
      } else {
        this.$router.push('/signin')
      }
    })
  }
})
