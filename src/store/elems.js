import firebase from 'firebase/app'

import Node from './NodeModel'

export default ({
  state: {
    elems: [
      /* {
        type: 'node',
        attrs: {
          id: '1a',
          fill: 'red',
          radius: 50,
          left: 0,
          top: 0
        }
      },
      {
        type: 'node',
        attrs: {
          id: '1b',
          fill: 'yellow',
          radius: 50,
          left: 150,
          top: 150
        }
      },
      {
        type: 'node',
        attrs: {
          id: '1c',
          fill: 'green',
          radius: 50,
          left: 200,
          top: 300
        }
      } */
    ]
  },
  mutations: {
    /* addElem (state, payload) {
      state.elems.push(payload)
    }, */
    newNode (state, {id, status, radius, top, left, user}) {
      state.elems.push({
        id, status, radius, top, left, user
      })
      // console.log(state.elems)
    },
    loadNodes (state, payload) {
      state.elems = payload
    },
    /* moveElem (state, payload) {
      const oldElem = state.elems.find(elem => elem.attrs.id === payload.id)
      const newElem = {
        attrs: {
          id: oldElem.attrs.id,
          state: oldElem.attrs.state,
          radius: oldElem.attrs.radius,
          left: (payload.left !== undefined) ? payload.left : oldElem.left,
          top: (payload.top !== undefined) ? payload.top : oldElem.top
        }
      }
      Object.assign(oldElem, newElem)
    } */
    editNode (state, payload) {
      const oldElem = state.elems.find(elem => elem.id === payload.id)
      const newElem = {
        id: oldElem.id,
        status: oldElem.status,
        radius: oldElem.radius,
        left: (payload.left !== undefined) ? payload.left : oldElem.left,
        top: (payload.top !== undefined) ? payload.top : oldElem.top
      }
      Object.assign(oldElem, newElem)
      /* const node = state.elems.find(elem => elem.id === payload.id)
      node.status = payload.status
      node.top = payload.top
      node.left = payload.left */
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
          payload.status,
          payload.radius,
          payload.left,
          payload.top,
          getters.user.id
        )
        const node = await firebase.database().ref('nodes').push(newNode)
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
            .ref('nodes')
            .orderByChild('user')
            .equalTo(getters.user.id)
            .once('value')
        // console.log(nodesResponse)
        // Get value
        const nodes = nodesResponse.val()
        // console.log(nodes)
        if (nodes != null) {
          // New array
          const nodesArray = []
          // Get task key (id)
          Object.keys(nodes).forEach(key => {
            const n = nodes[key]
            console.log(n)
            nodesArray.push(
              new Node(
                n.status,
                n.radius,
                n.left,
                n.top,
                n.user,
                key
              )
            )
          })
          // Send mutation
          commit('loadNodes', nodesArray)
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
    async editNode ({commit}, {id, changes}) {
      commit('clearError')
      commit('setLoading', true)
      try {
        // Update data fields
        await firebase.database().ref('nodes').child(id).update({
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
    }
  },
  getters: {
    elems (state) {
      return state.elems
    }
  }
})
