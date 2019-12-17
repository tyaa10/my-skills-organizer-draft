<template lang="pug">
.wrapper
  section
    .container
      .row.grid-center
        .col-xs-12.col-md-4.auth__form
          h1.ui-title-1 Visualize Your Aims and Achievements
          p MySkillsOrganizer is designed to manage your achievements and creative tasks. Add target nodes and dependencies between them, share the map of your self-development with the whole world!
        // Ячейка сетки для отображения формы входа в учетную запись Гугл
        .col-xs-12.col-md-4
          #firebaseui-auth-container
          v-tour(name='signin' :steps='steps' :callbacks="signinTourCallbacks")
            template(slot-scope='tour')
              transition(name='fade')
                v-step(v-if='tour.currentStep === index' v-for='(step, index) of tour.steps' :key='index' :step='step' :previous-step='tour.previousStep' :next-step='tour.nextStep' :stop='tour.stop' :is-first='tour.isFirst' :is-last='tour.isLast' :labels='tour.labels')
</template>

<script>
import firebase from 'firebase'
import firebaseui from 'firebaseui'
import '../../../node_modules/firebaseui/dist/firebaseui.css'
export default {
  name: 'signin',
  data () {
    return {
      steps: [
        {
          target: '#firebaseui-auth-container', // We're using document.querySelector() under the hood
          content: `Sign in to your Google Account`
        }
      ],
      signinTourCallbacks: {
        onStop: this.StopCallback
      }
    }
  },
  mounted () {
    // Инициализация и старт представления аутентификации Гугл
    var uiConfig = {
      signInSuccessUrl: '/',
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID
      ]
    }
    var ui = new firebaseui.auth.AuthUI(firebase.auth())
    ui.start('#firebaseui-auth-container', uiConfig)
    if (!this.$cookies.get('vtour_signin_finished')) {
      this.$tours['signin'].start()
    }
  },
  methods: {
    StopCallback () {
      if (this.$tours['signin'].isLast) {
        this.$cookies.set('vtour_signin_finished', true)
      }
    }
  }
}

</script>

<style lang="stylus" scoped>
  .auth__form
    text-align left !important
</style>
