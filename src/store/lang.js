import firebase from 'firebase/app'
import { i18n } from '../plugins/i18n'
import Cookie from 'js-cookie'

export default {
  state: {
    locale: 'en'
  },
  mutations: {
    setLocale (state, payload) {
      import(`../lang/${payload}.json`)
        .then((msgs) => {
          i18n.setLocaleMessage(payload, msgs)
          i18n.locale = payload
          state.locale = payload
        })
    }
  },
  actions: {
    async setLocale ({commit, getters}, payload) {
      commit('clearError')
      commit('setLoading', true)
      try {
        if (getters.user) {
          const localeResponse =
            await firebase.database()
              .ref(getters.user.id + '/locale')
              .once('value')
          // Get value
          const locale = localeResponse.val()
          if (locale != null) {
            await firebase.database()
              .ref(getters.user.id + '/locale')
              .child(Object.keys(locale)[0])
              .update({payload})
          } else {
            await firebase.database().ref(getters.user.id + '/locale').push({payload})
          }
        } else {
          Cookie.set('locale', payload)
        }
        commit('setLocale', payload)
        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    async loadLocale ({commit, getters}) {
      commit('clearError')
      commit('setLoading', true)
      try {
        // пытаемся получить локаль из удаленного хранилища
        const localeResponse =
          await firebase.database()
            .ref(getters.user.id + '/locale')
            .once('value')
        // Get value
        const locale = localeResponse.val()
        // пытаемся достать локаль из куки
        const cookiesLocale = Cookie.get('locale')
        if (cookiesLocale) {
          // Если в куки была локаль и в удаленном хранилище - тоже
          if (locale != null) {
            // обновляем ее в удаленном хранилище ...
            await firebase.database()
              .ref(getters.user.id + '/locale')
              .child(Object.keys(locale)[0])
              .update({payload: cookiesLocale})
          } else {
            // Иначе - отправляем ее в удаленное хранилище впервые ...
            await firebase.database().ref(getters.user.id + '/locale').push({payload: cookiesLocale})
          }
          // ... и устанавливаем ее текущей локально
          commit('setLocale', cookiesLocale)
          // Удаляем локаль из куки
          Cookie.remove('locale')
        } else if (locale != null) {
          // Иначе - если пришла локаль из удаленного хранилища -
          // Устанавливаем ее текущей
          commit('setLocale', Object.values(locale)[0].payload)
        }
        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    }
  },
  getters: {
    locale (state) {
      return state.locale
    }
  }
}
