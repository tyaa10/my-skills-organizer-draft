<template lang='pug'>
  .container(@contextmenu.prevent='$refs.menu.open')
    canvas.app-canvas#canvas(ref='canvas') Your browser is too old!
    vue-context(ref='menu')
      ul
        li(@click='onClick($event.target.innerText)') Edit Node
        li(@click='onClick($event.target.innerText)') Delete Node
    .fab(@click='addNodeClick') +
</template>

<script>
import { fabric } from 'fabric'
import { VueContext } from 'vue-context'
// import { mapMutations } from 'vuex'

export default {
  name: 'AppCanvas',

  components: {
    VueContext
  },

  data () {
    return {
      canvas: null,
      submitStatus: '',
      isObjectMoving: false
    }
  },

  computed: {
    elems () {
      // console.log(this.$store.getters.elems)
      // return this.$store.getters.elems.filter(n => n.type === 'node')
      return this.$store.getters.elems
    },
    width () {
      // return (70 * this.$parent.$el.clientWidth) / 100
      return this.$parent.$el.clientWidth
    },
    height () {
      // return (70 * this.$parent.$el.clientHeight) / 100
      return this.$parent.$el.clientHeight
    },
    widthCenter () {
      return this.width / 2
    },
    heightCenter () {
      return this.height / 2
    }
  },
  watch: {
    elems (newVal, oldVal) {
      // console.log(newVal, oldVal)
      this.fabricBullshit(newVal.filter(n => !oldVal.includes(n)))
    }
  },

  mounted () {
    this.canvas = new fabric.Canvas(this.$refs.canvas, {
      width: this.width,
      height: this.height,
      selectionColor: '#90ccb7',
      backgroundColor: '#fff'
    })
    this.canvas.on('object:moving', this.nodeMoving)
    this.canvas.on('mouse:up', this.nodeMouseUp)
    this.canvas.on('object:modified', this.nodeModified)
    this.fabricBullshit(this.elems)
  },

  methods: {
    // ...mapMutations(['addElem', 'moveElem']),
    fabricBullshit (elems) {
      elems.forEach(n => {
        var color = 'red'
        if (n.status === 'new') {
          color = 'gray'
        }
        // console.log(n)
        var rect = new fabric.Circle({id: n.id, fill: color, radius: n.radius, top: n.top, left: n.left})
        this.canvas.add(rect)
      }
      )
    },

    addNodeClick () {
      /* this.addElem({
        type: 'node',
        attrs: {
          id: '2a',
          fill: 'blue',
          radius: 50,
          left: 0,
          top: 0
        }
      }) */
      this.$store.dispatch('newNode', {
        status: 'new',
        radius: 50,
        left: 0,
        top: 0
      })
        .then(() => {
          this.submitStatus = 'OK'
          this.fabricBullshit(this.elems)
        })
        .catch(err => {
          this.submitStatus = err.message
        })
    },
    nodeMoving (ev) {
      this.isObjectMoving = true
    },
    nodeMouseUp (ev) {
      if (this.isObjectMoving) {
        var modifiedObject = ev.target
        this.isObjectMoving = false
        // console.log(modifiedObject.get('id'), modifiedObject.get('left'), modifiedObject.get('top'))
        const id = modifiedObject.get('id')
        const newLeft = modifiedObject.get('left')
        const newTop = modifiedObject.get('top')
        /* this.editNode({
          id: id,
          changes: {
            left: newLeft,
            top: newTop
          }
        }) */
        this.$store.dispatch('editNode', {
          id: id,
          changes: {
            left: newLeft,
            top: newTop
          }
        })
          .then(() => {
            this.submitStatus = 'OK'
          })
          .catch(err => {
            this.submitStatus = err.message
          })
      }
    },
    onClick (text) {
      alert(`You clicked ${text}!`)
    }/* ,
    nodeModified (ev) {
      var modifiedObject = ev.target
      // console.log(modifiedObject.get('id'), modifiedObject.get('left'), modifiedObject.get('top'))
      if (!this.isObjectMoving) {
        console.log(modifiedObject.get('id'), modifiedObject.get('left'), modifiedObject.get('top'))
        const id = modifiedObject.get('id')
        const newLeft = modifiedObject.get('left')
        const newTop = modifiedObject.get('top')
        this.editNode({
          id: id,
          changes: {
            left: newLeft,
            top: newTop
          }
        })
      }
    } */
  }
}
</script>
