<template lang="pug">
.content-wrapper
  // В верхней части разметки располагаем представления для всплывающих
  // сообщений из библиотеки uimini
  #cancelledMessage.ui-message.ui-message--danger
    span.message-title Cancelled
  #doneMessage.ui-message.ui-message--success
    span.message-title Done
  #errorMessage.ui-message.ui-message--danger
    span.message-title Error
  // Секция, содержащая экземпляр пользовательского компонента FabricCanvas
  // для отображения дерева целей и задач текущего шаблона
  .templateData(v-if="currentUserId && currentTemplateId")
    span.ui-title-4 Template:
    = ' '
    span.ui-text-regular "{{selectedTemplate.title}}".
    = ' '
    span.ui-title-4 Accessible by id:
    = ' '
    span.ui-text-regular {{currentUserId}}@{{currentTemplateId}}
  section#c(ref='canvasContainer' @click='hideRightSidebar')
    FabricCanvas(:elems-getter="elemsGetter", :deps-getter="depsGetter", :action-names="actionNames", ref="fabricCanvasHandler")
  .right-sidebar.full
    .button.button-default.right-sidebar-toggle-button#templatesSidebarOpenButton(@click='toggleTemplatesSidebar')
      span(v-if="!templatesSidebarShown") &lt;
      span(v-else) &gt;
    .container
      .sidebar-content
        .button.button-default.templates-actions-button(@click='addTempClick' v-tooltip="'add'") +
        .button.button-default.templates-actions-button(@click='importTempClick' v-tooltip.top-center="'import'")
          font-awesome-icon(:icon="'file-import'")
        .button.button-default.templates-actions-button(v-if="checkTemplate" @click='editTempClick' v-tooltip.top-center="'edit'")
          font-awesome-icon(:icon="'edit'")
        .button.button-default.templates-actions-button(v-if="checkTemplate" @click='delTempClick' v-tooltip.top-center="'delete'")
          font-awesome-icon(:icon="'trash'")
        .button.button-default.templates-actions-button(v-if="checkTemplate" @click='useTempClick' v-tooltip.top-center="'use'") u
        .sidebar-list
          transition-group
            .sidebar-item.templates-item(
              v-for="temp in temps"
              :key="temp.id"
              :class="{ public: temp.access, selected: (currentTemplateId === temp.id) }"
              v-on:click="templatesItemClick(temp.id)"
            )
              p.ui-text-regular {{ temp.title }}
  // Dialog Box - Template
  .ui-messageBox__wrapper#templatesModal
    .ui-messageBox.fadeInDown
      .ui-messageBox__header
        span.messageBox-title {{formStaticContent[tempFormMode].title}}
        span.button-close.ui-messageBox-close
      .ui-messageBox__content
        span {{formStaticContent[tempFormMode].description}}
        // Форма создания / редактирования узла.
        // Подавление стандартной отправки пост-запроса формой
        form(v-if="tempFormMode == 'create' || tempFormMode == 'edit'" v-on:submit.prevent='')
          // Привязка блока с полем ввода к свойству модели
          // с указанием текстов ошибок валидации
          .form-item(:class="{ 'form-group--error': $v.selectedTemplate.title.$error }")
            label.form__label(for='titleInput') Title
            // Поле ввода заголовка узла
            input.form__input#titleInput(type='text' placeholder='Title' v-model.trim="$v.selectedTemplate.title.$model")
          .error(v-if="!$v.selectedTemplate.title.required") Field is required
          .error(v-if="!$v.selectedTemplate.title.minLength") Title must have at least {{$v.selectedTemplate.title.$params.minLength.min}} letters
          .error(v-if="!$v.selectedTemplate.title.maxLength") Title must have at most {{$v.selectedTemplate.title.$params.maxLength.max}} letters
          .form-item(:class="{ 'form-group--error': $v.selectedTemplate.description.$error }")
            label.form__label(for='descriptionTextarea') Description
            // Область ввода текста краткого описания узла
            textarea.form__input#descriptionTextarea(placeholder='Description …' v-model.trim="$v.selectedTemplate.description.$model")
          .error(v-if="!$v.selectedTemplate.description.required") Field is required
          .error(v-if="!$v.selectedTemplate.description.minLength") Description must have at least {{$v.selectedTemplate.description.$params.minLength.min}} letters
          .error(v-if="!$v.selectedTemplate.description.maxLength") Description must have at most {{$v.selectedTemplate.description.$params.maxLength.max}} letters
          .row
            .col-xs-6(style='margin-bottom: 16px;')
              ul
                li
                  .ui-checkbox-wrapper
                    // Флаг открытия доступа к данным узла для систем сбора информации
                    // о потенциальных клиентах
                    input#accessCheckbox.ui-checkbox(type='checkbox' v-model='selectedTemplate.access')
                    label.label--inline(for='accessCheckbox') Public
        // Форма импорта шаблона по его глобальному ИД
        // Подавление стандартной отправки пост-запроса формой
        form(v-if="tempFormMode == 'import'" v-on:submit.prevent='')
          // Привязка блока с полем ввода к свойству модели
          // с указанием текстов ошибок валидации
          .form-item(:class="{ 'form-group--error': $v.importTemplate.id.$error }")
            label.form__label(for='importTemplateIdInput') Id:
            // Поле ввода глобального ИД импортируемого шаблона
            input.form__input#importTemplateIdInput(type='text' placeholder='Import Template Id' v-model.trim="$v.importTemplate.id.$model")
          .error(v-if="!$v.importTemplate.id.required") Field is required
      .ui-messageBox__footer
        .button.button-light.ui-messageBox-cancel Cancel
        .button.button-primary.ui-messageBox-ok(v-if="tempFormMode == 'create' || tempFormMode == 'edit'") OK
        .button.button-primary.ui-messageBox-ok(v-else-if="tempFormMode == 'import'") OK
</template>
<script>
import { showRightSidebar, hideRightSidebar, uiMessage, showMessage } from '@/assets/js/uimini.js'
import { required, minLength, maxLength } from 'vuelidate/lib/validators'
// import Experimental from '@/components/Experimental.vue'
import FabricCanvas from '@/components/FabricCanvas.vue'
export default {
  components: {
    // Experimental
    FabricCanvas
  },
  data () {
    return {
      elemsGetter: 'templateElems',
      depsGetter: 'templateDeps',
      actionNames: {
        newNode: 'newTemplateNode',
        editNode: 'editTemplateNode',
        deleteNode: 'deleteTemplateNode',
        newDep: 'newTemplateDep',
        deleteDep: 'deleteTemplateDep'
      },
      selectedTemplate: {
        title: '',
        description: '',
        access: false
      },
      templatesSidebarShown: true,
      tempCreateDialogHandler: null,
      tempEditDialogHandler: null,
      tempDeleteDialogHandler: null,
      tempUseDialogHandler: null,
      tempImportDialogHandler: null,
      tempFormMode: 'create',
      formStaticContent: {
        create: {
          title: 'Create',
          description: 'Create a New Template'
        },
        edit: {
          title: 'Edit',
          description: 'Edit Selected Template'
        },
        delete: {
          title: 'Delete',
          description: 'Delete Selected Template'
        },
        use: {
          title: 'Use',
          description: 'Add a copy of the selected template to the main skill tree?'
        },
        import: {
          title: 'Import',
          description: 'Import template by global id'
        }
      },
      submitStatus: '',
      treeCopyingCompleted: false,
      templateNodesDictionary: null,
      importTemplate: {
        id: null
      }
    }
  },
  // Правила валидации
  validations: {
    selectedTemplate: {
      title: {
        required,
        minLength: minLength(8),
        maxLength: maxLength(128)
      },
      description: {
        required,
        minLength: minLength(8),
        maxLength: maxLength(500)
      }
    },
    importTemplate: {
      id: {
        required
      }
    }
  },
  computed: {
    temps () {
      // источник данных о шаблонах
      return this.$store.getters.temps
    },
    currentUserId () {
      return this.$store.getters.user.id || null
    },
    currentTemplateId () {
      return this.$store.getters.currentTemplateId
    },
    checkTemplate () {
      // Проверка: есть ли выделенный шаблон в списке
      return this.currentTemplateId !== null
    }
  },
  watch: {
    treeCopyingCompleted (newVal, oldVal) {
      if (newVal === true) {
        this.copyDeps()
      }
    }
  },
  methods: {
    hideRightSidebar () {
      if (this.templatesSidebarShown) {
        hideRightSidebar()
        this.templatesSidebarShown = false
      }
    },
    toggleTemplatesSidebar () {
      if (this.templatesSidebarShown) {
        hideRightSidebar()
        this.templatesSidebarShown = false
      } else {
        showRightSidebar()
        this.templatesSidebarShown = true
      }
    },
    addTempClick () {
      // Вызов очистки формы редактирования данных узла
      this.resetTempForm()
      // this.tempFormMode = 'create'
      this.tempCreateDialogHandler = uiMessage(this.tempCreateDialogItOk, this.tempCreateDialogItCancel, 'templatesModal')
      this.tempCreateDialogHandler.call()
      // console.log('this.tempFormMode = ' + this.tempFormMode)
    },
    editTempClick () {
      this.tempFormMode = 'edit'
      this.tempEditDialogHandler = uiMessage(this.tempEditDialogItOk, this.tempEditDialogItCancel, 'templatesModal')
      this.tempEditDialogHandler.call()
    },
    delTempClick () {
      this.tempFormMode = 'delete'
      this.tempDeleteDialogHandler = uiMessage(this.tempDeleteDialogItOk, this.tempDeleteDialogItCancel, 'templatesModal')
      this.tempDeleteDialogHandler.call()
    },
    importTempClick () {
      console.log('importTempClick')
      this.tempFormMode = 'import'
      this.tempImportDialogHandler = uiMessage(this.tempImportDialogItOk, this.tempImportDialogItCancel, 'templatesModal')
      this.tempImportDialogHandler.call()
    },
    useTempClick () {
      // console.log('useTempClick')
      this.tempFormMode = 'use'
      this.tempUseDialogHandler = uiMessage(this.tempUseDialogItOk, this.tempUseDialogItCancel, 'templatesModal')
      this.tempUseDialogHandler.call()
    },
    tempCreateDialogItOk () {
      if (!this.$v.selectedTemplate.$invalid) {
        // Вызываем в хранилище действие создания шаблона
        const store = this.$store
        store.dispatch('newTemplate', {
          title: this.selectedTemplate.title,
          description: this.selectedTemplate.description,
          access: this.selectedTemplate.access
        })
          .then(() => {
            store.dispatch('loadTemplateNodes')
              .then(() => {
                store.dispatch('loadTemplateDeps')
              })
              .then(() => {
                this.tempCreateDialogHandler = null
                this.toggleTemplatesSidebar()
                showMessage('#doneMessage')
              })
          })
      } else {
        showMessage('#cancelledMessage')
      }
    },
    tempCreateDialogItCancel () {
      // Вызываем в хранилище действие удаления выделенного узла
      // console.log('tempCreateDialogItCancel')
      this.tempCreateDialogHandler = null
      showMessage('#cancelledMessage')
    },
    tempEditDialogItOk () {
      // Вызываем в хранилище действие Edit шаблона
      // TODO Отправлять для обновления только изменившиеся значения
      // console.log('tempEditDialogItOk')
      if (!this.$v.selectedTemplate.$invalid) {
        this.$store.dispatch('editTemplate', {
          changes: {
            title: this.selectedTemplate.title,
            description: this.selectedTemplate.description,
            access: this.selectedTemplate.access
          }
        })
          .then(() => {
            this.tempEditDialogHandler = null
            showMessage('#doneMessage')
          })
      } else {
        showMessage('#cancelledMessage')
      }
    },
    tempEditDialogItCancel () {
      // Вызываем в хранилище действие изменения выделенного Template
      this.tempEditDialogHandler = null
      showMessage('#cancelledMessage')
    },
    tempDeleteDialogItOk () {
      // Вызываем в хранилище действие удаления выделенного Template
      this.$store.dispatch('deleteTemplate')
        .then(() => {
          this.tempDeleteDialogHandler = null
          this.$store.dispatch('loadTemplateNodes')
            .then(() => {
              this.$store.dispatch('loadTemplateDeps')
            })
          // this.$refs.fabricCanvasHandler.fabricReDraw()
          showMessage('#doneMessage')
        })
    },
    tempDeleteDialogItCancel () {
      // Отменяем действие удаления выделенного Template
      this.tempDeleteDialogHandler = null
      showMessage('#cancelledMessage')
    },
    tempUseDialogItOk () {
      // Copy Nodes
      let maxNodeTop = this.$store.getters.elems[0].top
      this.$store.getters.elems.forEach(n => {
        if (n.top > maxNodeTop) {
          maxNodeTop = n.top
        }
      })
      // console.log(maxNodeTop)
      let minTempNodeTop = this.$store.getters.templateElems[0].top
      let minTempNodeLeft = this.$store.getters.templateElems[0].left
      this.$store.getters.templateElems.forEach(n => {
        if (n.top < minTempNodeTop) {
          minTempNodeTop = n.top
        }
        if (n.left < minTempNodeLeft) {
          minTempNodeLeft = n.left
        }
      })
      this.templateNodesDictionary = []
      let treeCopyingCount = 0
      this.$store.getters.templateElems.forEach(n => {
        this.$store.dispatch('newNode', {
          title: n.title,
          type: n.type,
          description: n.description,
          access: n.access,
          status: n.status,
          dependenciesSatisfied: n.dependenciesSatisfied,
          radius: n.radius,
          left: n.left - minTempNodeLeft + 100,
          top: n.top - minTempNodeTop + maxNodeTop + 50
        })
          .then(() => {
            this.submitStatus = 'OK'
            // console.log(n.id, this.$store.getters.lastCreatedElemId)
            this.templateNodesDictionary[n.id] = this.$store.getters.lastCreatedElemId
            treeCopyingCount++
            if (treeCopyingCount === this.$store.getters.templateElems.length) {
              // console.log(this.$store.getters.templateElems.length)
              this.treeCopyingCompleted = true
            }
          })
          .catch(err => {
            this.submitStatus = err.message
            showMessage('#errorMessage')
          })
      })
      // Copy Dependencies
      // const depsArray = []
    },
    tempUseDialogItCancel () {
      // Вызываем в хранилище действие удаления выделенного узла
      console.log('tempUseDialogItCancel')
    },
    // Import OK
    tempImportDialogItOk () {
      if (!this.$v.importTemplate.$invalid) {
        // this.$refs.fabricCanvasHandler.fabricClearCanvas()
        const [importUserId, importTemplateId] = this.importTemplate.id.split('@')
        const store = this.$store
        store.dispatch('setCurrentTemplateId', null)
          .then(() => {
            store.dispatch('loadTemplateNodes')
              .then(() => {
                store.dispatch('loadTemplateDeps')
              })
          })
        store.dispatch('importTemplate', {
          importUserId,
          importTemplateId
        })
          .then(() => {
            store.dispatch('loadTemplateNodes')
              .then(() => {
                store.dispatch('loadTemplateDeps')
              })
              .then(() => {
                this.tempImportDialogHandler = null
                showMessage('#doneMessage')
              })
          })
      } else {
        showMessage('#cancelledMessage')
      }
    },
    // Import Cancel
    tempImportDialogItCancel () {
      console.log('tempImportDialogItCancel')
    },
    // Метод сброса состояния формы создания/редактирования узла
    resetTempForm () {
      this.selectedTemplate = {
        title: '',
        description: '',
        access: false
      }
      this.tempFormMode = 'create'
    },
    // Метод установки выбранного шаблона
    // для дальнейшего редактирования в форме
    setTempForm () {
      if (this.checkTemplate) {
        this.selectedTemplate = this.temps.find(temp => temp.id === this.currentTemplateId)
      }
    },
    templatesItemClick (id) {
      const store = this.$store
      store.dispatch('setCurrentTemplateId', id)
        .then(() => {
          this.setTempForm()
          store.dispatch('loadTemplateNodes')
            .then(() => {
              store.dispatch('loadTemplateDeps')
            })
        })
    },
    copyDeps () {
      this.$store.getters.templateDeps.forEach((d, i, array) => {
        // depsArray.push(d)
        // Отправка в хранилище команды "Создать новую зависимость"
        // console.log(d, d.fromNodeId, this.templateNodesDictionary[d.fromNodeId])
        this.$store.dispatch('newDep', {
          fromNodeId: this.templateNodesDictionary[d.fromNodeId],
          toNodeId: this.templateNodesDictionary[d.toNodeId]
        })
          .then(() => {
            // Если удалось - устанавливается флаг успешно завершенной операции
            this.submitStatus = 'OK'
            if (i === array.length - 1) {
              this.templateNodesDictionary = null
              this.treeCopyingCompleted = false
              showMessage('#doneMessage')
            }
          })
          .catch(err => {
            this.submitStatus = err.message
            showMessage('#errorMessage')
          })
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
  span.ui-title-4
    display inline !important
  .templates-actions-button
    margin 5px
  .templates-item
    padding-left 10px
    &.selected
      background-color #CCC
      font-weight bold
</style>
