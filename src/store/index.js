import Vue from 'vue'
import Vuex from 'vuex'
// import createPersistedState from 'vuex-persistedstate'
// import * as Cookies from 'js-cookie'

import elems from './elems'
import user from './user'
import deps from './dependencies'
import common from './common'
// import User from './UserModel'
// import Node from './NodeModel'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    elems, user, common, deps
  }/* ,
  plugins: [createPersistedState()] */
})
