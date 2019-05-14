<template lang='pug'>
  .container(v-on:contextmenu.prevent='contextMenuOpen')
    #cancelledMessage.ui-message.ui-message--danger
      span.message-title Cancelled
    #doneMessage.ui-message.ui-message--success
      span.message-title Done
    canvas.app-canvas#canvas(ref='canvas') Your browser is too old!
    // Context Menu
    vue-context(ref='menu' v-if="checkNode || checkDep")
      ul
        li#editNodeContextMenuItem(@click='onContextMenuClick($event.target.id)' v-if="checkNode") Edit Node
        li#addDependencyContextMenuItem(@click='onContextMenuClick($event.target.id)' v-if="checkNode") Add Dependency
        li#deleteNodeContextMenuItem(@click='onContextMenuClick($event.target.id)' v-if="checkNode") Delete Node
        li#deleteDepContextMenuItem(@click='onContextMenuClick($event.target.id)' v-if="checkDep") Delete Dependency
    // Dialog Box - Delete or not delete the node
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
      selectedDepId: null,
      nodeDeleteDialogHandler: null,
      depDeleteDialogHandler: null,
      selectedNode: {
        title: '',
        description: '',
        type: '',
        status: '1',
        access: false
      },
      formMode: '',
      dependenceCreationHint: null,
      dependentNodeId: null
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
    deps () {
      return this.$store.getters.deps
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
    },
    checkDep () {
      return this.selectedDepId !== null
    }
  },
  watch: {
    elems (newVal, oldVal) {
      this.fabricDraw(this.elems, this.deps)
      // this.fabricDraw(newVal.filter(n => !oldVal.includes(n)))
    },
    deps (newVal, oldVal) {
      this.fabricDraw(this.elems, this.deps)
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
    this.canvas.on('mouse:move', this.mouseMove)
    this.canvas.on('mouse:down', this.mouseDown)
    this.fabricDraw(this.elems, this.deps)
    // Start message
    // this.nodeDeleteDialogHandler = uiMessage(this.nodeDeleteDialogItOk, this.nodeDeleteDialogItCancel)
    // this.depDeleteDialogHandler = uiMessage(this.depDeleteDialogItOk, this.depDeleteDialogItCancel)
  },

  methods: {
    // ...mapMutations(['addElem', 'moveElem']),
    fabricDraw (elems, deps) {
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
        var rect = new fabric.Circle({id: n.id, fill: color, radius: n.radius, top: n.top, left: n.left})
        this.canvas.add(rect)
        this.canvas.sendToBack(rect)
      }
      )
      this.drawLines(elems, deps)
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
        this.selectedNodeId = null
        this.selectedDepId = null
        if (this.canvas.getActiveObject().get('type') === 'circle') {
          this.selectedNodeId = selectedObject.get('id')
        } else if (this.canvas.getActiveObject().get('type') === 'line') {
          this.selectedDepId = selectedObject.get('id')
        }
      }
    },
    selectionCleared (ev) {
      this.selectedNodeId = null
      this.selectedDepId = null
      hideSidebar()
    },
    selectionUpdated (ev) {
      var updatedObject = this.canvas.getActiveObject()
      if (typeof (updatedObject) !== 'undefined') {
        this.selectedNodeId = null
        this.selectedDepId = null
        if (this.canvas.getActiveObject().get('type') === 'circle') {
          this.selectedNodeId = updatedObject.get('id')
        } else if (this.canvas.getActiveObject().get('type') === 'line') {
          this.selectedDepId = updatedObject.get('id')
        }
      }
    },
    // Handle mousemove when dependence creation hint is shown
    mouseMove (ev) {
      if (this.isObjectMoving) {
        var modifiedObject = ev.target
        const id = modifiedObject.get('id')
        const newLeft = modifiedObject.get('left')
        const newTop = modifiedObject.get('top')
        this.moveLine(id, newLeft, newTop, this.deps)
      }
    },
    // Handle mousedown when dependence creation is finishing
    mouseDown (ev) {
      if (this.dependenceCreationHint !== null) {
        if (ev.target && this.checkNode) {
          this.$store.dispatch('newDep', {
            fromNodeId: this.dependentNodeId,
            toNodeId: this.selectedNodeId
          })
            .then(() => {
              this.submitStatus = 'OK'
              // this.fabricDraw(this.elems)
            })
            .catch(err => {
              this.submitStatus = err.message
            })
        } else {
          console.log('dependency creation is cancelled')
        }
        this.canvas.remove(this.dependenceCreationHint)
        this.dependenceCreationHint = null
        this.dependentNodeId = null
      }
    },
    contextMenuOpen (ev) {
      if (this.$refs.menu) {
        this.$refs.menu.open(ev)
      }
    },
    onContextMenuClick (id) {
      if (id === 'deleteNodeContextMenuItem') {
        this.nodeDeleteDialogHandler = uiMessage(this.nodeDeleteDialogItOk, this.nodeDeleteDialogItCancel)
        this.nodeDeleteDialogHandler.call()
      } else if (id === 'addDependencyContextMenuItem') {
        // TODO
        var hintText = new fabric.Text('Select parent node', {top: this.canvas.getActiveObject().top - 20, left: this.canvas.getActiveObject().left, fontSize: 20})
        this.canvas.insertAt(hintText, this.canvas.getObjects().length)
        hintText.hasControls = hintText.hasBorders = hintText.selectable = false
        // hintText.bringToFront()
        this.dependenceCreationHint = hintText
        this.dependentNodeId = this.selectedNodeId
      } else if (id === 'editNodeContextMenuItem') {
        this.setForm()
        showSidebar()
        this.formMode = 'edit'
      } else if (id === 'deleteDepContextMenuItem') {
        this.depDeleteDialogHandler = uiMessage(this.depDeleteDialogItOk, this.depDeleteDialogItCancel)
        this.depDeleteDialogHandler.call()
      }
    },
    nodeDeleteDialogItOk () {
      this.$store.dispatch('deleteNode', this.selectedNodeId)
        .then(() => {
          this.nodeDeleteDialogHandler = null
          showMessage('#doneMessage')
        })
    },
    nodeDeleteDialogItCancel () {
      this.nodeDeleteDialogHandler = null
      showMessage('#cancelledMessage')
    },
    depDeleteDialogItOk () {
      this.$store.dispatch('deleteDep', this.selectedDepId)
        .then(() => {
          this.depDeleteDialogHandler = null
          showMessage('#doneMessage')
        })
    },
    depDeleteDialogItCancel () {
      this.depDeleteDialogHandler = null
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
            this.fabricDraw(this.elems, this.deps)
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
    },
    makeLine (id, coords) {
      return new fabric.Line(coords, {
        id: id,
        fill: '#999999',
        stroke: '#999999',
        strokeWidth: 5,
        selectable: true,
        evented: true,
        hasControls: false,
        lockMovementX: true,
        lockMovementY: true
      })
    },
    makeArrow (lineId, x1, y1, x2, y2) {
      // координаты центра отрезка
      const x3 = (x1 + x2) / 2
      const y3 = (y1 + y2) / 2
      // длина отрезка
      const d = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
      // координаты вектора
      const x = x2 - x1
      const y = y2 - y1
      // координаты точки, удалённой от центра к началу отрезка на 10px
      const x4 = x3 - (x / d) * 10
      const y4 = y3 - (y / d) * 10
      const xp = y2 - y1
      const yp = x1 - x2
      // координаты перпендикуляров, удалённых от точки X4;Y4 на 5px в разные стороны
      const x5 = x4 + (xp / d) * 5
      const y5 = y4 + (yp / d) * 5
      const x6 = x4 - (xp / d) * 5
      const y6 = y4 - (yp / d) * 5
      return {
        'arrow1': new fabric.Line([x5, y5, x3, y3], {
          id: lineId + '_a1',
          fill: '#999999',
          stroke: '#999999',
          strokeWidth: 5,
          selectable: false,
          evented: false
        }),
        'arrow2': new fabric.Line([x6, y6, x3, y3], {
          id: lineId + '_a2',
          fill: '#999999',
          stroke: '#999999',
          strokeWidth: 5,
          selectable: false,
          evented: false
        })
      }
    },
    drawLines (elems, deps) {
      this.canvas.remove(...this.canvas.getObjects().filter(o => o.get('type') === 'line'))
      var lostLinesIds = []
      deps.forEach(d => {
        const nodeFrom = elems.filter(n => n.id === d.fromNodeId)
        const nodeTo = elems.filter(n => n.id === d.toNodeId)
        if (nodeFrom[0] && nodeTo[0]) {
          var line = this.makeLine(d.id, [ nodeFrom[0].left + 50, nodeFrom[0].top + 50, nodeTo[0].left + 50, nodeTo[0].top + 50 ])
          var arrow = this.makeArrow(d.id, nodeFrom[0].left + 50, nodeFrom[0].top + 50, nodeTo[0].left + 50, nodeTo[0].top + 50)
          this.canvas.add(line, arrow.arrow1, arrow.arrow2)
          this.canvas.sendToBack(line)
          this.canvas.sendToBack(arrow.arrow1)
          this.canvas.sendToBack(arrow.arrow2)
          this.canvas.renderAll()
        } else {
          if (!lostLinesIds.includes(d.id)) {
            lostLinesIds.push(d.id)
          }
        }
      }
      )
      lostLinesIds.forEach(lostLineId => {
        // const deletedDep = deps.find(dep => dep.id === lostLineId)
        // deps.splice(deps.indexOf(deletedDep), 1)
        this.$store.dispatch('deleteDep', lostLineId)
          .then(() => {
            console.log('Lost dependency ' + lostLineId + ' is deleted')
          })
      })
    },
    moveLine (nodeId, newLeft, newTop, deps) {
      const depsFromIds = deps.filter(d => d.fromNodeId === nodeId).map(d => d.id)
      const depsToIds = deps.filter(d => d.toNodeId === nodeId).map(d => d.id)
      const lines = this.canvas.getObjects().filter(o => o.get('type') === 'line')
      lines.filter(l => depsFromIds.includes(l.get('id'))).forEach(l => {
        const newLineX1 = newLeft + 50
        const newLineY1 = newTop + 50
        const newLineX2 = l.get('x2')
        const newLineY2 = l.get('y2')
        l.set({ 'x1': newLineX1, 'y1': newLineY1 })
        const lineId = l.get('id')
        const lineArrow1 = lines.filter(la1 => la1.get('id') === lineId + '_a1')[0]
        const lineArrow2 = lines.filter(la2 => la2.get('id') === lineId + '_a2')[0]
        const newLineArrow = this.makeArrow(lineId, newLineX1, newLineY1, newLineX2, newLineY2)
        lineArrow1.set({
          'x1': newLineArrow.arrow1.get('x1'),
          'y1': newLineArrow.arrow1.get('y1'),
          'x2': newLineArrow.arrow1.get('x2'),
          'y2': newLineArrow.arrow1.get('y2')
        })
        lineArrow2.set({
          'x1': newLineArrow.arrow2.get('x1'),
          'y1': newLineArrow.arrow2.get('y1'),
          'x2': newLineArrow.arrow2.get('x2'),
          'y2': newLineArrow.arrow2.get('y2')
        })
        this.canvas.sendToBack(lineArrow1)
        this.canvas.sendToBack(lineArrow2)
      }
      )
      lines.filter(l => depsToIds.includes(l.get('id'))).forEach(l => {
        const newLineX1 = l.get('x1')
        const newLineY1 = l.get('y1')
        const newLineX2 = newLeft + 50
        const newLineY2 = newTop + 50
        l.set({ 'x2': newLineX2, 'y2': newLineY2 })
        const lineId = l.get('id')
        const lineArrow1 = lines.filter(la1 => la1.get('id') === lineId + '_a1')[0]
        const lineArrow2 = lines.filter(la2 => la2.get('id') === lineId + '_a2')[0]
        const newLineArrow = this.makeArrow(lineId, newLineX1, newLineY1, newLineX2, newLineY2)
        lineArrow1.set({
          'x1': newLineArrow.arrow1.get('x1'),
          'y1': newLineArrow.arrow1.get('y1'),
          'x2': newLineArrow.arrow1.get('x2'),
          'y2': newLineArrow.arrow1.get('y2')
        })
        lineArrow2.set({
          'x1': newLineArrow.arrow2.get('x1'),
          'y1': newLineArrow.arrow2.get('y1'),
          'x2': newLineArrow.arrow2.get('x2'),
          'y2': newLineArrow.arrow2.get('y2')
        })
        this.canvas.sendToBack(lineArrow1)
        this.canvas.sendToBack(lineArrow2)
      }
      )
      this.canvas.renderAll()
      // this.canvas.remove(...lines.filter(o => o.get('id') === 'line'))
      /* deps.forEach(d => {
        const nodeFrom = elems.filter(n => n.id === d.fromNodeId)
        const nodeTo = elems.filter(n => n.id === d.toNodeId)
        var line = this.makeLine([ nodeFrom[0].left + 50, nodeFrom[0].top + 50, nodeTo[0].left + 50, nodeTo[0].top + 50 ])
        this.canvas.add(line)
        this.canvas.sendToBack(line)
        this.canvas.renderAll()
      }
      ) */
    }/* ,
    nodeModified (ev) {
      var modifiedObject = ev.target
    } */
  }
}
</script>
