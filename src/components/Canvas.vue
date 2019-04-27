<template lang='pug'>
  .container(@contextmenu.prevent='$refs.menu.open')
    canvas.app-canvas#canvas(ref='canvas') Your browser is too old!
    vue-context(ref='menu')
      ul
        li#editNodeContextMenuItem(@click='onContextMenuClick($event.target.id)') Edit Node
        li#deleteNodeContextMenuItem(@click='onContextMenuClick($event.target.id)') Delete Node
    .ui-messageBox__wrapper
      .ui-messageBox.fadeInDown
        .ui-messageBox__header
          span.messageBox-title Delete the Node
          span.button-close.ui-messageBox-close
        .ui-messageBox__content
          span Node will be deleted permanently
        .ui-messageBox__footer
          .button.button-light.ui-messageBox-cancel Cancel
          .button.button-primary.ui-messageBox-ok OK
    .fab(@click='addNodeClick') +
</template>

<script>
import { fabric } from 'fabric'
import { VueContext } from 'vue-context'
import { uiMessage } from '@/assets/js/uimini.js'
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
      isObjectMoving: false,
      selectedNodeId: null,
      messageDialogHandler: null
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
      backgroundColor: '#fff',
      selection: false
    })
    this.canvas.on('object:moving', this.nodeMoving)
    this.canvas.on('mouse:up', this.nodeMouseUp)
    this.canvas.on('object:modified', this.nodeModified)
    // this.canvas.on('object:selected', this.nodeSelected)
    // this.canvas.on('object:deselected', this.nodeDeselected)
    this.canvas.on('selection:created', this.selectionCreated)
    this.canvas.on('selection:cleared', this.selectionCleared)
    this.canvas.on('selection:updated', this.selectionUpdated)
    this.fabricBullshit(this.elems)
    // Start message
    this.messageDialogHandler = uiMessage()
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
    }, /*
    nodeSelected (ev) {
      var selectedObject = ev.target
      console.log('nodeSelected', selectedObject.get('id'))
    },
    nodeDeselected (ev) {
      var selectedObject = ev.target
      console.log('nodeDeselected', selectedObject.get('id'))
    }, */
    selectionCreated (ev) {
      var selectedObject = this.canvas.getActiveObject()
      if (typeof (this.canvas.getActiveObject()) !== 'undefined') {
        // selectedObject = canvas.getActiveObject()
        console.log('selectedObject', selectedObject.get('id'))
      }
    },
    selectionCleared (ev) {
      // var selectedObject = ev.target
      console.log('selectionCleared')
    },
    selectionUpdated (ev) {
      var updatedObject = this.canvas.getActiveObject()
      if (typeof (updatedObject) !== 'undefined') {
        // selectedObject = canvas.getActiveObject()
        console.log('updatedObject', updatedObject.get('id'))
      }
    },
    onContextMenuClick (id) {
      if (id === 'deleteNodeContextMenuItem') {
        this.messageDialogHandler.call()
      } else {
        /* var selectedObject;
        if(typeof(canvas.getActiveObject()) !== 'undefined') {
          selectedObject = canvas.getActiveObject()
          console.log('selectedObject', selectedObject)
        } else {
          console.log('selectedObject', 'nil')
        } */
      }
    }/* ,
    nodeModified (ev) {
      var modifiedObject = ev.target
    } */
  }
}
</script>
