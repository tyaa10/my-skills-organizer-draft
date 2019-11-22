import firebase from 'firebase/app'

import Template from './TemplateModel'

export default ({
  state: {
    temps: [],
    currentTemplateId: null
  },
  mutations: {
    setCurrentTemplateId (state, payload) {
      state.currentTemplateId = payload
    },
    newTemplate (
      state,
      {
        id,
        title,
        description,
        access
      }
    ) {
      state.temps.push({
        id,
        title,
        description,
        access
      })
    },
    loadTemplates (state, payload) {
      state.temps = payload
      /* state.temps.forEach(t => {
        console.log(t)
      }) */
    },
    editTemplate (state, payload) {
      const oldTemp = state.temps.find(temp => temp.id === payload.id)
      const newTemp = {
        id: oldTemp.id,
        title: (payload.title !== undefined) ? payload.title : oldTemp.title,
        description: (payload.description !== undefined) ? payload.description : oldTemp.description,
        access: (payload.access !== undefined) ? payload.access : oldTemp.access
      }
      Object.assign(oldTemp, newTemp)
    },
    deleteTemplate (state, payload) {
      const deletedTemplate = state.temps.find(temp => temp.id === payload.id)
      state.temps.splice(state.temps.indexOf(deletedTemplate), 1)
    }
  },
  actions: {
    /* Create a new Template */
    async newTemplate ({commit, getters}, payload) {
      commit('clearError')
      commit('setLoading', true)
      try {
        // Use helped class
        const newTemplate = new Template(
          payload.title,
          payload.description,
          payload.access
        )
        const template = await firebase.database().ref(getters.user.id + '/templates').push(newTemplate)
        // Send mutations
        commit('setCurrentTemplateId', template.key)
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
    async editTemplate ({commit, getters}, {changes}) {
      commit('clearError')
      commit('setLoading', true)
      try {
        // Update data fields
        const id = getters.currentTemplateId
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
    async deleteTemplate ({commit, getters}) {
      commit('clearError')
      commit('setLoading', true)
      try {
        const id = getters.currentTemplateId
        await firebase.database().ref(getters.user.id + '/templates').child(id).remove()
        commit('deleteTemplate', {id})
        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    async setCurrentTemplateId ({commit}, id) {
      commit('clearError')
      commit('setLoading', true)
      try {
        // await firebase.database().ref(getters.user.id + '/nodes').child(id).remove()
        commit('setCurrentTemplateId', id)
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
    },
    currentTemplateId (state) {
      return state.currentTemplateId
    }
  }
})
