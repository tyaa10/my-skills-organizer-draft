<template lang='pug'>
  .container(v-on:contextmenu.prevent='contextMenuOpen')
    #cancelledMessage.ui-message.ui-message--danger
      span.message-title Cancelled
    #doneMessage.ui-message.ui-message--success
      span.message-title Done
    canvas.app-canvas#canvas(ref='canvas') Your browser is too old!
    vue-context(ref='menu' v-if="checkNode")
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
import { uiMessage, showMessage } from '@/assets/js/uimini.js'
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
    },
    checkNode () {
      return this.selectedNodeId !== null
    }
  },
  watch: {
    elems (newVal, oldVal) {
      console.log(newVal, oldVal)
      this.fabricDraw(this.elems)
      // this.fabricDraw(newVal.filter(n => !oldVal.includes(n)))
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
    this.canvas.on('selection:created', this.selectionCreated)
    this.canvas.on('selection:cleared', this.selectionCleared)
    this.canvas.on('selection:updated', this.selectionUpdated)
    this.fabricDraw(this.elems)
    // Start message
    this.messageDialogHandler = uiMessage(this.messageDialogItOk, this.messageDialogItCancel)
  },

  methods: {
    // ...mapMutations(['addElem', 'moveElem']),
    fabricDraw (elems) {
      this.canvas.remove(...this.canvas.getObjects())
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
      this.$store.dispatch('newNode', {
        status: 'new',
        radius: 50,
        left: 0,
        top: 0
      })
        .then(() => {
          this.submitStatus = 'OK'
          // this.fabricDraw(this.elems)
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
    selectionCreated (ev) {
      var selectedObject = this.canvas.getActiveObject()
      if (typeof (this.canvas.getActiveObject()) !== 'undefined') {
        // selectedObject = canvas.getActiveObject()
        // console.log('selectedObject', selectedObject.get('id'))
        this.selectedNodeId = selectedObject.get('id')
      }
    },
    selectionCleared (ev) {
      // var selectedObject = ev.target
      // console.log('selectionCleared')
      this.selectedNodeId = null
    },
    selectionUpdated (ev) {
      var updatedObject = this.canvas.getActiveObject()
      if (typeof (updatedObject) !== 'undefined') {
        // selectedObject = canvas.getActiveObject()
        // console.log('updatedObject', updatedObject.get('id'))
        this.selectedNodeId = updatedObject.get('id')
      }
    },
    contextMenuOpen (ev) {
      if (this.$refs.menu) {
        this.$refs.menu.open(ev)
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
    },
    messageDialogItOk () {
      this.$store.dispatch('deleteNode', this.selectedNodeId)
        .then(() => {
          // this.canvas.clear()
          // this.fabricDraw(this.elems)
          showMessage('#doneMessage')
          /* this.$store.dispatch('loadNodes')
            .then(() => {
              console.log('node deleted')
              // this.fabricDraw(this.elems)
              showMessage('#doneMessage')
            }) */
        })
    },
    messageDialogItCancel () {
      showMessage('#cancelledMessage')
    }/* ,
    nodeModified (ev) {
      var modifiedObject = ev.target
    } */
  }
}
</script>
