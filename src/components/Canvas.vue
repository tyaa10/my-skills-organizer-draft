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
    .sidebar-open-button
      .button-burger
        span.line.line-1
        span.line.line-2
        span.line.line-3
    .sidebar
      .container
        .sidebar-content
          form(v-on:submit.prevent='')
            .form-item(:class="{ 'form-group--error': $v.selectedNode.title.$error }")
              label.form__label(for='titleInput') Title
              input.form__input#titleInput(type='text' placeholder='Title' v-model.trim="$v.selectedNode.title.$model")
            .error(v-if="!$v.selectedNode.title.required") Field is required
            .error(v-if="!$v.selectedNode.title.minLength") Title must have at least {{$v.selectedNode.title.$params.minLength.min}} letters
            .error(v-if="!$v.selectedNode.title.maxLength") Title must have at most {{$v.selectedNode.title.$params.maxLength.max}} letters
            .form-item(:class="{ 'form-group--error': $v.selectedNode.type.$error }")
              label.form__label(for='typeSelect') Type
              select.form__input#typeSelect(v-model.trim="$v.selectedNode.type.$model")
                option(disabled='' value='') select type
                option(value='1') basis
                option(value='2') desobjectivation
                option(value='3') objectification
            .error(v-if="!$v.selectedNode.type.required") Field is required
            .form-item(:class="{ 'form-group--error': $v.selectedNode.description.$error }")
              label.form__label(for='descriptionTextarea') Description
              textarea.form__input#descriptionTextarea(placeholder='Description …' v-model.trim="$v.selectedNode.description.$model")
            .error(v-if="!$v.selectedNode.description.required") Field is required
            .error(v-if="!$v.selectedNode.description.minLength") Description must have at least {{$v.selectedNode.description.$params.minLength.min}} letters
            .error(v-if="!$v.selectedNode.description.maxLength") Description must have at most {{$v.selectedNode.description.$params.maxLength.max}} letters
            .form-item
              label.form__label(for='statusSelect') Status
              select.form__input#statusSelect(v-model='selectedNode.status')
                option(value='1') new
                option(value='2') scheduled
                option(value='3') started
                option(value='4') suspended
                option(value='5') cancelled
                option(value='6') done
            .row
              .col-xs-6(style='margin-bottom: 16px;')
                ul
                  li
                    .ui-checkbox-wrapper
                      input#accessCheckbox.ui-checkbox(type='checkbox' v-model='selectedNode.access')
                      label.label--inline(for='accessCheckbox') Public
            .row.grid-middle
              .col-xs-6
                button.button--round.button--big.button.button-default(type='reset' @click='resetForm') Discard
              .col-xs-6
                button.button--round.button--big.button.button-success(type='submit' :disabled='$v.selectedNode.$invalid' @click.prevent='applyNodeDataClick') Apply
</template>

<script>
import { fabric } from 'fabric'
import { VueContext } from 'vue-context'
import { uiMessage, showMessage, showSidebar, hideSidebar } from '@/assets/js/uimini.js'
import { required, minLength, maxLength } from 'vuelidate/lib/validators'
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
      messageDialogHandler: null,
      selectedNode: {
        title: '',
        description: '',
        type: '',
        status: '1',
        access: false
      },
      formMode: ''
    }
  },
  validations: {
    selectedNode: {
      title: {
        required,
        minLength: minLength(8),
        maxLength: maxLength(128)
      },
      type: {
        required
      },
      description: {
        required,
        minLength: minLength(8),
        maxLength: maxLength(500)
      }
    }
  },
  computed: {
    elems () {
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
      // console.log(newVal, oldVal)
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
        var color = 'white'
        if (n.status === '1') {
          color = '#ccc'
        } else if (n.status === '2' && n.dependenciesSatisfied) {
          color = '#0066FF'
        } else if (n.status === '2' && !n.dependenciesSatisfied) {
          color = '#FF0000'
        } else if (n.status === '3') {
          color = '#FFFF00'
        } else if (n.status === '4') {
          color = '#999999'
        } else if (n.status === '5') {
          color = '#333333'
        } else if (n.status === '6') {
          color = '#26de81'
        }
        // console.log(n)
        var rect = new fabric.Circle({id: n.id, fill: color, radius: n.radius, top: n.top, left: n.left})
        this.canvas.add(rect)
      }
      )
    },

    addNodeClick () {
      this.resetForm()
      this.formMode = 'create'
      showSidebar()
    },
    nodeMoving (ev) {
      this.isObjectMoving = true
    },
    nodeMouseUp (ev) {
      if (this.isObjectMoving) {
        var modifiedObject = ev.target
        this.isObjectMoving = false
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
        this.selectedNodeId = selectedObject.get('id')
      }
    },
    selectionCleared (ev) {
      this.selectedNodeId = null
      hideSidebar()
    },
    selectionUpdated (ev) {
      var updatedObject = this.canvas.getActiveObject()
      if (typeof (updatedObject) !== 'undefined') {
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
      } else if (id === 'editNodeContextMenuItem') {
        this.setForm()
        showSidebar()
        this.formMode = 'edit'
      }
    },
    messageDialogItOk () {
      this.$store.dispatch('deleteNode', this.selectedNodeId)
        .then(() => {
          showMessage('#doneMessage')
        })
    },
    messageDialogItCancel () {
      showMessage('#cancelledMessage')
    },
    setForm () {
      if (this.checkNode) {
        this.selectedNode = this.elems.find(elem => elem.id === this.selectedNodeId)
      }
    },
    applyNodeDataClick () {
      if (this.formMode === 'create') {
        this.$store.dispatch('newNode', {
          title: this.selectedNode.title,
          type: this.selectedNode.type,
          description: this.selectedNode.description,
          access: this.selectedNode.access,
          status: this.selectedNode.status,
          dependenciesSatisfied: false,
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
      } else if (this.formMode === 'edit') {
        this.$store.dispatch('editNode', {
          id: this.selectedNodeId,
          changes: {
            title: this.selectedNode.title,
            type: this.selectedNode.type,
            description: this.selectedNode.description,
            status: this.selectedNode.status,
            access: this.selectedNode.access
          }
        })
          .then(() => {
            this.submitStatus = 'OK'
            this.fabricDraw(this.elems)
          })
          .catch(err => {
            this.submitStatus = err.message
          })
      }
      hideSidebar()
      this.formMode = ''
    },
    resetForm () {
      this.selectedNode = {
        title: '',
        description: '',
        type: '',
        status: '1',
        access: false
      }
      hideSidebar()
      this.formMode = ''
    }/* ,
    nodeModified (ev) {
      var modifiedObject = ev.target
    } */
  }
}
</script>
