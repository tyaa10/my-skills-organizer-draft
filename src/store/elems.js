import firebase from 'firebase/app'

import Node from './NodeModel'

export default ({
  state: {
    // Локальный массив элементов для отображения (моделей узлов целей)
    elems: [],
    // ... для узлов шаблона, выбранного в разделе "Шаблоны"
    templateElems: []
  },
  mutations: {
    newNode (
      state,
      {
        id,
        title,
        type,
        description,
        access,
        status,
        dependenciesSatisfied,
        radius,
        top,
        left
      }
    ) {
      state.elems.push({
        id,
        title,
        type,
        description,
        access,
        status,
        dependenciesSatisfied,
        radius,
        top,
        left
      })
    },
    loadNodes (state, payload) {
      state[payload.target] = payload.nodes
    },
    editNode (state, payload) {
      const oldElem = state.elems.find(elem => elem.id === payload.id)
      const newElem = {
        id: oldElem.id,
        title: (payload.title !== undefined) ? payload.title : oldElem.title,
        type: (payload.type !== undefined) ? payload.type : oldElem.type,
        description: (payload.description !== undefined) ? payload.description : oldElem.description,
        access: (payload.access !== undefined) ? payload.access : oldElem.access,
        status: (payload.status !== undefined) ? payload.status : oldElem.status,
        dependenciesSatisfied: (payload.dependenciesSatisfied !== undefined) ? payload.dependenciesSatisfied : oldElem.dependenciesSatisfied,
        radius: (payload.radius !== undefined) ? payload.radius : oldElem.radius,
        left: (payload.left !== undefined) ? payload.left : oldElem.left,
        top: (payload.top !== undefined) ? payload.top : oldElem.top
      }
      Object.assign(oldElem, newElem)
    },
    deleteNode (state, payload) {
      const deletedNode = state.elems.find(elem => elem.id === payload.id)
      state.elems.splice(state.elems.indexOf(deletedNode), 1)
    }
  },
  actions: {
    /* Create new Node */
    // Local
    /* addElem ({commit}, payload) {
      payload.attrs.id = Math.random()
      commit('addElem', payload)

    }, */
    // With BackEnd
    async newNode ({commit, getters}, payload) {
      commit('clearError')
      commit('setLoading', true)
      try {
        // Use helped class
        const newNode = new Node(
          payload.title,
          payload.type,
          payload.description,
          payload.access,
          payload.status,
          payload.dependenciesSatisfied,
          payload.radius,
          payload.left,
          payload.top// ,
          // getters.user.id
        )
        const node = await firebase.database().ref(getters.user.id + '/nodes').push(newNode)
        // Send mutation
        commit('newNode', {
          ...newNode,
          id: node.key
        })

        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    async loadNodes ({commit, getters}) {
      commit('clearError')
      commit('setLoading', true)
      try {
        const nodesResponse =
          await firebase.database()
            .ref(getters.user.id + '/nodes')
            // .orderByChild('user')
            // .equalTo(getters.user.id)
            .once('value')
        // Get value
        const nodes = nodesResponse.val()
        // console.log(nodes)
        if (nodes != null) {
          // New array
          const nodesArray = []
          // Get task key (id)
          Object.keys(nodes).forEach(key => {
            const n = nodes[key]
            // console.log(n)
            nodesArray.push(
              new Node(
                n.title,
                n.type,
                n.description,
                n.access,
                n.status,
                n.dependenciesSatisfied,
                n.radius,
                n.left,
                n.top,
                // n.user,
                key
              )
            )
          })
          const payload = {
            target: 'elems',
            nodes: nodesArray
          }
          // Send mutation
          commit('loadNodes', payload)
        }

        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    /* moveElem ({commit}, payload) {
      // console.log('act')
      commit('moveElem', payload)
    } */
    async editNode ({commit, getters}, {id, changes}) {
      commit('clearError')
      commit('setLoading', true)
      try {
        // Update data fields
        await firebase.database().ref(getters.user.id + '/nodes').child(id).update({
          ...changes
        })
        // Send mutation
        commit('editNode', {id, ...changes})

        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    async deleteNode ({commit, getters}, id) {
      commit('clearError')
      commit('setLoading', true)
      try {
        await firebase.database().ref(getters.user.id + '/nodes').child(id).remove()
        commit('deleteNode', {id})
        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    }
  },
  getters: {
    elems (state) {
      return state.elems
    }
  }
})
