import firebase from 'firebase/app'

import Template from './TemplateModel'

export default ({
  state: {
    temps: []
  },
  mutations: {
    newTemplate (
      state,
      {
        id,
        title,
        description,
        access,
        link
      }
    ) {
      state.temps.push({
        id,
        title,
        description,
        access,
        link
      })
    },
    loadTemplates (state, payload) {
      state.temps = payload
    },
    editTemplate (state, payload) {
      const oldTemp = state.temps.find(temp => temp.id === payload.id)
      const newTemp = {
        id: oldTemp.id,
        title: (payload.title !== undefined) ? payload.title : oldTemp.title,
        description: (payload.description !== undefined) ? payload.description : oldTemp.description,
        access: (payload.access !== undefined) ? payload.access : oldTemp.access,
        link: (payload.link !== undefined) ? payload.link : oldTemp.link
      }
      Object.assign(oldTemp, newTemp)
    },
    deleteTemplate (state, payload) {
      const deletedTemplate = state.temps.find(temp => temp.id === payload.id)
      state.temps.splice(state.temps.indexOf(deletedTemplate), 1)
    }
  },
  actions: {
    /* Create new Template */
    async newTemplate ({commit, getters}, payload) {
      commit('clearError')
      commit('setLoading', true)
      try {
        // Use helped class
        const newTemplate = new Template(
          payload.title,
          payload.description,
          payload.access,
          payload.link
        )
        const template = await firebase.database().ref(getters.user.id + '/templates').push(newTemplate)
        // Send mutation
        commit('newTemplate', {
          ...newTemplate,
          id: template.key
        })

        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    // Загрузить список шаблонов
    async loadTemplates ({commit, getters}) {
      commit('clearError')
      commit('setLoading', true)
      try {
        const templatesResponse =
          await firebase.database()
            .ref(getters.user.id + '/templates')
            .once('value')
        // Get value
        const templates = templatesResponse.val()
        // console.log(Templates)
        if (templates != null) {
          // New array
          const templatesArray = []
          // Get template's key (id)
          Object.keys(templates).forEach(key => {
            const n = templates[key]
            templatesArray.push(
              new Template(
                n.title,
                n.description,
                n.access,
                n.link,
                key
              )
            )
          })
          // Send mutation
          commit('loadTemplates', templatesArray)
        }

        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    /* async loadTemplates ({commit, getters}) {
      commit('clearError')
      commit('setLoading', true)
      try {
        const templatesResponse =
          await firebase.database()
            .ref(getters.user.id + '/templates')
            .once('value')
        // Get value
        const templates = templatesResponse.val()
        if (templates != null) {
          // New array
          const templatesArray = []
          // Get task key (id)
          Object.keys(templates).forEach(key => {
            const n = templates[key]
            templatesArray.push(
              new Template(
                n.title,
                n.description,
                n.access,
                n.link,
                key
              )
            )
          })
          // Send mutation
          commit('loadTemplates', templatesArray)
        }

        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    }, */
    async editTemplate ({commit, getters}, {id, changes}) {
      commit('clearError')
      commit('setLoading', true)
      try {
        // Update data fields
        await firebase.database().ref(getters.user.id + '/templates').child(id).update({
          ...changes
        })
        // Send mutation
        commit('editTemplate', {id, ...changes})

        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    async deleteTemplate ({commit, getters}, id) {
      commit('clearError')
      commit('setLoading', true)
      try {
        await firebase.database().ref(getters.user.id + '/templates').child(id).remove()
        commit('deleteTemplate', {id})
        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    }
  },
  getters: {
    temps (state) {
      return state.temps
    }
  }
})
