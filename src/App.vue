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
      ]/* ,
      photo: '',
      userId: '',
      name: '',
      email: '',
      user: {} */
    }
  },
  created () {
    // this.user = firebase.auth().currentUser
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        store.dispatch('loggedUser', user)
        store.dispatch('loadNodes', user)
        store.dispatch('loadDeps', user)
        /* this.user = user
        this.name = user.displayName
        this.email = user.email
        this.photo = user.photoURL
        this.userId = user.uid */
      } else {
        /* this.user = {}
        this.name = ''
        this.email = ''
        this.photo = ''
        this.userId = '' */
      }
    })
  },
  computed: {
    checkUser () {
      return store.getters.checkUser
    },
    userData () {
      // console.log('this.user', store.getters.user)
      return store.getters.user
    },
    isLoading () {
      // console.log('this.$store.getters.loading', this.$store.getters.loading)
      return this.$store.getters.loading
    }
  },
  watch: {
    $route (to, from) {
      // console.log(from, to)
      if (!this.checkUser && to.name !== 'signin') {
        this.$router.push('/signin')
      }
    }
  },
  methods: {
    signOut () {
      // firebase.auth().signOut()
      store.dispatch('logoutUser')
    }
  }
}
</script>

<style lang="stylus">
  @import './assets/stylus/main.styl'
</style>
