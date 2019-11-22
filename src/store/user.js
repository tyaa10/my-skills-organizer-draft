import firebase from 'firebase/app'

import User from './UserModel'

export default {
  state: {
    user: null
  },
  mutations: {
    setUser (state, payload) {
      state.user = payload
    }
  },
  actions: {
    // Login page
    // Сейчас не используется, так как аутентификация только при помощи службы Гугл
    async loginUser ({commit}, {email, password}) {
      commit('clearError')
      commit('setLoading', true)
      try {
        // logic
        const user = await firebase.auth().signInWithEmailAndPassword(email, password)
        commit('setUser', new User(user.user.uid, user.user.displayName, user.user.photoURL))

        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    // Logged
    loggedUser ({commit}, payload) {
      // Send mutation new uid used helped Class
      commit('setUser', new User(payload.uid, payload.displayName, payload.photoURL))
    },
    // Logout
    logoutUser ({commit}) {
      firebase.auth().signOut()
      // Send mutation null
      commit('setUser', null)
    }
  },
  getters: {
    // Return user (for get id)
    user (state) {
      return state.user
    },
    // Check User (for logged)
    checkUser (state) {
      return state.user !== null
    }
  }
}
