<template lang="pug">
.wrapper
  section
    .container
      .row.grid-center
        .col-xs-12.col-md-4.auth__form
          h1.ui-title-1 Visualize Your Aims and Achievements
          p MySkillsOrganizer is designed to manage your achievements and creative tasks. Add target nodes and dependencies between them, share the map of your self-development with the whole world!
        .col-xs-12.col-md-4
          #firebaseui-auth-container
</template>

<script>
import firebase from 'firebase'
import firebaseui from 'firebaseui'
import '../../../node_modules/firebaseui/dist/firebaseui.css'
// import {config} from '../../helpers/firebaseConfig'
export default {
  name: 'signin',
  mounted () {
    var uiConfig = {
      signInSuccessUrl: '/',
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID
      ]
    }
    var ui = new firebaseui.auth.AuthUI(firebase.auth())
    ui.start('#firebaseui-auth-container', uiConfig)
  }
}

</script>

<style lang="stylus" scoped>
  .auth__form
    text-align left !important
</style>
