import Vue from 'vue'
import Vuex from 'vuex'
// import createPersistedState from 'vuex-persistedstate'
// import * as Cookies from 'js-cookie'

import elems from './elems'
import user from './user'
import deps from './dependencies'
import messaging from './messaging'
import common from './common'
import templates from './templates'
import lang from './lang'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    elems, user, common, deps, messaging, templates, lang
  }/* ,
  plugins: [createPersistedState()] */
})
