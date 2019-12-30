<template lang="pug">
.wrapper
  section
    .container
      .row.grid-center
        .col-xs-12.col-md-4.auth__form
          h1.ui-title-1 {{$t('signin.header')}}
          p {{$t('signin.description')}}
        // Ячейка сетки для отображения формы входа в учетную запись Гугл
        // и ссылки на обучающее видео
        .col-xs-12.col-md-4
          // Контейнер для рендеринга стандартного интерфейса аутентификации Гугл
          #firebaseui-auth-container
          // Кнопка просмотра обучающего видео
          VideoTutorialButton(:url="$t('video-tutorial-button.url')")
          v-tour(name='signin' :steps='steps' :callbacks="signinTourCallbacks")
            template(slot-scope='tour')
              transition(name='fade')
                v-step(v-if='tour.currentStep === index' v-for='(step, index) of tour.steps' :key='index' :step='step' :previous-step='tour.previousStep' :next-step='tour.nextStep' :stop='tour.stop' :is-first='tour.isFirst' :is-last='tour.isLast' :labels='tour.labels')
</template>

<script>
import firebase from 'firebase'
import firebaseui from 'firebaseui'
import '../../../node_modules/firebaseui/dist/firebaseui.css'
import VideoTutorialButton from '../Common/VideoTutorialButton'
export default {
  name: 'signin',
  components: {
    VideoTutorialButton
  },
  data () {
    return {
      signinTourCallbacks: {
        onStop: this.StopCallback
      }
    }
  },
  computed: {
    steps () {
      return [
        {
          target: '#firebaseui-auth-container', // We're using document.querySelector() under the hood
          content: this.$t('signin.vtour.signinGoogle')
        }
      ]
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
    // var ui = new firebaseui.auth.AuthUI(firebase.auth())
    let ui = firebaseui.auth.AuthUI.getInstance()
    if (!ui) {
      ui = new firebaseui.auth.AuthUI(firebase.auth())
    }
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
