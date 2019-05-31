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

// var firebaseMessagingTokenKey = null
// var lastUser = null

Vue.prototype.$firebaseMessagingTokenKey = null
Vue.prototype.$lastUser = null

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>',
  propData: {
    firebaseMessagingTokenKey: this.$firebaseMessagingTokenKey,
    lastUser: this.$lastUser
  },
  created () {
    firebase.initializeApp(config)
    const FIREBASE_MESSAGING = firebase.messaging()
    const FIREBASE_DATABASE = firebase.database()
    const MAIN_THIS = this
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        MAIN_THIS.$lastUser = user
        MAIN_THIS.$router.push('/')
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
            console.log('a new token', token)
            return FIREBASE_MESSAGING.getToken().then((token) => {
              /* var tokenExists = false
              FIREBASE_DATABASE.ref(MAIN_THIS.$store.getters.user.id + '/tokens').once('value', function (snapshot) {
                console.log('snapshot', snapshot)
                if (snapshot.exists()) {
                  const userTokens = snapshot.val()
                  console.log('userTokens', userTokens)
                  if (userTokens) {
                    Object.keys(userTokens).some(key => {
                      const t = userTokens[key]
                      console.log(t.token, token)
                      if (t.token === token) {
                        tokenExists = true
                        MAIN_THIS.$firebaseMessagingTokenKey = key
                        MAIN_THIS.$store.dispatch('setTokenKey', MAIN_THIS.$firebaseMessagingTokenKey)
                        return true
                      }
                    })
                  }
                }
              })
              console.log('tokenExists = ' + tokenExists)
              if (!tokenExists) {
                MAIN_THIS.$firebaseMessagingTokenKey = FIREBASE_DATABASE.ref(MAIN_THIS.$store.getters.user.id + '/tokens').push({
                  token: token
                }).key
                MAIN_THIS.$store.dispatch('setTokenKey', MAIN_THIS.$firebaseMessagingTokenKey)
              }
              console.log('this.$firebaseMessagingTokenKey = ', MAIN_THIS.$firebaseMessagingTokenKey) */
              FIREBASE_DATABASE.ref(MAIN_THIS.$store.getters.user.id + '/tokens')
                .orderByChild('token')
                .equalTo(token)
                .once('value', function (snapshot) {
                  console.log('snapshot', snapshot)
                  console.log('snapshot.exists()', snapshot.exists())
                  if (!snapshot.exists()) {
                    MAIN_THIS.$firebaseMessagingTokenKey = FIREBASE_DATABASE.ref(MAIN_THIS.$store.getters.user.id + '/tokens').push({
                      token: token
                    }).key
                  } else {
                    const tokens = snapshot.val()
                    if (tokens != null) {
                      MAIN_THIS.$firebaseMessagingTokenKey = Object.keys(tokens)[0]
                    }
                  }
                  console.log('setTokenKey', MAIN_THIS.$firebaseMessagingTokenKey)
                  MAIN_THIS.$store.dispatch('setTokenKey', MAIN_THIS.$firebaseMessagingTokenKey)
                })
            })
          }).catch(err => {
            console.log(err)
          })
        FIREBASE_MESSAGING.onMessage(function (payload) {
          console.log('Message received. ', payload)
        })
      } else {
        console.log('this.$lastUser2', MAIN_THIS.$lastUser)
        console.log('this.$firebaseMessagingTokenKey2 = ', MAIN_THIS.$firebaseMessagingTokenKey)
        MAIN_THIS.$lastUser = null
        MAIN_THIS.$firebaseMessagingTokenKey = null
        MAIN_THIS.$router.push('/signin')
      }
    })
  }
})
