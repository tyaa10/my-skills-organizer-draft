<template lang="pug">
  .wrapper
    header
      .navbar
        .container
          .navbar-content
            router-link.header-logo(
              to="/"
            ) Skills Organizr
            .button-burger(
              @click="menuShow = !menuShow"
              :class="{ active: menuShow }"
            )
              span.line.line-1
              span.line.line-2
              span.line.line-3
            .navbar-list__wrapper(
              :class="{ active: menuShow }"
            )
              ul.navbar-list
                li.navbar-item(
                  v-for="link in linkMenu"
                  :key="link.title"
                  @click="menuShow = false"
                )
                  router-link.navbar-link(
                    :to="`${link.url}`"
                  ) {{ link.title }}
                li.navbar-item(
                  v-if="checkUser"
                  @click='signOut'
                )
                  span.navbar-link SignOut ({{userData.name}})
                    img(:src="userData.photo" style="height: 32px; width: 32px; border-radius: 50%")

    router-view
    .cssload-loader(v-show="isLoading")
      .cssload-inner.cssload-one
      .cssload-inner.cssload-two
      .cssload-inner.cssload-three
</template>

<script>
import firebase from 'firebase'
import store from './store'
export default {
  data () {
    return {
      menuShow: false,
      linkMenu: [
        {title: 'Home', url: '/'},
        {title: 'Templates', url: '/templates'},
        {title: 'AboutUs', url: '/about'}
      ]
    }
  },
  props: ['firebaseMessagingTokenKey', 'lastUser'],
  created () {
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        store.dispatch('loggedUser', user)
        store.dispatch('loadNodes', user)
        store.dispatch('loadDeps', user)
      } else {}
    })
  },
  computed: {
    checkUser () {
      return store.getters.checkUser
    },
    userData () {
      return store.getters.user
    },
    isLoading () {
      return this.$store.getters.loading
    }
  },
  watch: {
    $route (to, from) {
      if (!this.checkUser && to.name !== 'signin') {
        this.$router.push('/signin')
      }
    }
  },
  methods: {
    signOut () {
      // firebase.auth().signOut()
      const FIREBASE_DATABASE = firebase.database()
      // console.log('lastUser3', store.getters.user)
      // console.log('firebaseMessagingTokenKey3 = ', store.getters.firebaseMessagingTokenKey)
      if (store.getters.firebaseMessagingTokenKey) {
        // delete firebaseMessagingTokenKey
        FIREBASE_DATABASE.ref(store.getters.user.id + '/tokens').child(store.getters.firebaseMessagingTokenKey).remove()
      }
      store.dispatch('setTokenKey', null)
      store.dispatch('logoutUser')
    }
  }
}
</script>

<style lang="stylus">
  @import './assets/stylus/main.styl'
</style>
