export default {
  state: {
    firebaseMessagingTokenKey: null
  },
  mutations: {
    setTokenKey (state, payload) {
      state.firebaseMessagingTokenKey = payload
    }
  },
  actions: {
    setTokenKey ({commit}, payload) {
      // Send mutation new uid used helped Class
      commit('setTokenKey', payload)
    }
  },
  getters: {
    firebaseMessagingTokenKey (state) {
      return state.firebaseMessagingTokenKey
    }
  }
}
