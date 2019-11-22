import firebase from 'firebase/app'

import Dep from './DependencyModel'

export default ({
  state: {
    deps: [],
    templateDeps: []
  },
  mutations: {
    newDep (
      state,
      {
        id,
        fromNodeId,
        toNodeId
      }
    ) {
      state.deps.push({
        id,
        fromNodeId,
        toNodeId
      })
    },
    newTempDep (
      state,
      {
        id,
        fromNodeId,
        toNodeId,
        templateId
      }
    ) {
      state.templateDeps.push({
        id,
        fromNodeId,
        toNodeId,
        templateId
      })
    },
    loadDeps (state, payload) {
      state[payload.target] = payload.deps
    },
    deleteDep (state, payload) {
      const deletedDep = state[payload.target].find(dep => dep.id === payload.id)
      if (deletedDep) {
        state[payload.target].splice(state[payload.target].indexOf(deletedDep), 1)
      }
    }
  },
  actions: {
    async newDep ({commit, getters}, payload) {
      commit('clearError')
      commit('setLoading', true)
      try {
        // Use helped class
        const newDep = new Dep(
          payload.fromNodeId,
          payload.toNodeId
        )
        const dep = await firebase.database().ref(getters.user.id + '/dependencies').push(newDep)
        // Send mutation
        commit('newDep', {
          ...newDep,
          id: dep.key
        })

        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    async newTemplateDep ({commit, getters}, payload) {
      commit('clearError')
      commit('setLoading', true)
      try {
        // Use helped class
        const newDep = new Dep(
          payload.fromNodeId,
          payload.toNodeId
        )
        const currentTemplateId = getters.currentTemplateId
        const dep = await firebase.database().ref(getters.user.id + '/templates/' + currentTemplateId + '/dependencies').push(newDep)
        // Send mutation
        commit('newTempDep', {
          ...newDep,
          // templateId: currentTemplateId,
          id: dep.key
        })

        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    async loadDeps ({commit, getters}) {
      commit('clearError')
      commit('setLoading', true)
      try {
        const depsResponse =
          await firebase.database()
            .ref(getters.user.id + '/dependencies')
            .once('value')
        const deps = depsResponse.val()
        if (deps != null) {
          const depsArray = []
          Object.keys(deps).forEach(key => {
            const d = deps[key]
            depsArray.push(
              new Dep(
                d.fromNodeId,
                d.toNodeId,
                key
              )
            )
          })
          // Send mutation
          const payload = {
            target: 'deps',
            deps: depsArray
          }
          commit('loadDeps', payload)
        }

        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    async loadTemplateDeps ({commit, getters}) {
      commit('clearError')
      commit('setLoading', true)
      try {
        const currentTemplateId = getters.currentTemplateId
        const depsResponse =
          await firebase.database()
            .ref(getters.user.id + '/templates/' + currentTemplateId + '/dependencies')
            .once('value')
        const deps = depsResponse.val()
        const depsArray = []
        if (deps != null) {
          Object.keys(deps).forEach(key => {
            const d = deps[key]
            depsArray.push(
              new Dep(
                d.fromNodeId,
                d.toNodeId,
                key
              )
            )
          })
        }
        // Send mutation
        const payload = {
          target: 'templateDeps',
          deps: depsArray
        }
        commit('loadDeps', payload)
        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    async deleteDep ({commit, getters}, id) {
      commit('clearError')
      commit('setLoading', true)
      try {
        await firebase.database().ref(getters.user.id + '/dependencies').child(id).remove()
        const payload = {
          id,
          target: 'deps'
        }
        commit('deleteDep', payload)
        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    async deleteTemplateDep ({commit, getters}, id) {
      commit('clearError')
      commit('setLoading', true)
      try {
        const currentTemplateId = getters.currentTemplateId
        await firebase.database().ref(getters.user.id + '/templates/' + currentTemplateId + '/dependencies').child(id).remove()
        const payload = {
          id,
          target: 'templateDeps'
        }
        commit('deleteDep', payload)
        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    }
  },
  getters: {
    deps (state) {
      return state.deps
    },
    templateDeps (state) {
      return state.templateDeps
    }
  }
})
