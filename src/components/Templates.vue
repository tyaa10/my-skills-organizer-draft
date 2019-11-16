<template lang="pug">
.wrapper
  // В верхней части разметки располагаем представления для всплывающих
  // сообщений из библиотеки uimini
  #cancelledMessage.ui-message.ui-message--danger
    span.message-title Cancelled
  #doneMessage.ui-message.ui-message--success
    span.message-title Done
  section
    .container
      h1.ui-title-1 Templates
    .container
      Experimental(:elems-getter="elemsGetter", :deps-getter="depsGetter", :action-names="actionNames")
  .right-sidebar.full
    .button.button-default.right-sidebar-toggle-button#templatesSidebarOpenButton(@click='toggleTemplatesSidebar')
      span(v-if="!templatesSidebarShown") &lt;
      span(v-else) &gt;
    .container
      .sidebar-content
        .button.button-default.templates-actions-button(@click='addTempClick') +
        .button.button-default.templates-actions-button(@click='importTempClick') i
        .button.button-default.templates-actions-button(v-if="checkTemplate" @click='editTempClick') e
        .button.button-default.templates-actions-button(v-if="checkTemplate" @click='delTempClick') d
        .button.button-default.templates-actions-button(v-if="checkTemplate" @click='useTempClick') u
        .sidebar-list
          transition-group
            .sidebar-item.templates-item(
              v-for="temp in temps"
              :key="temp.id"
              :class="{ public: temp.access, selected: (selectedTempId === temp.id) }"
              v-on:click="templatesItemClick(temp.id)"
            )
              p.ui-text-regular {{ temp.title }}
  // Dialog Box - Create a new template
  .ui-messageBox__wrapper
    .ui-messageBox.fadeInDown
      .ui-messageBox__header
        span.messageBox-title {{formStaticContent[formMode].title}}
        span.button-close.ui-messageBox-close
      .ui-messageBox__content
        span {{formStaticContent[formMode].description}}
        // Форма создания / редактирования узла.
        // Подавление стандартной отправки пост-запроса формой
        form(v-if="formMode == 'create'" v-on:submit.prevent='')
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
      .ui-messageBox__footer
        .button.button-light.ui-messageBox-cancel Cancel
        .button.button-primary.ui-messageBox-ok OK
</template>
<script>
import { showRightSidebar, hideRightSidebar, uiMessage, showMessage } from '@/assets/js/uimini.js'
import { required, minLength, maxLength } from 'vuelidate/lib/validators'
import Experimental from '@/components/Experimental.vue'
export default {
  components: {
    Experimental
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
      selectedTempId: null,
      tempCreateDialogHandler: null,
      formMode: 'create',
      formStaticContent: {
        create: {
          title: 'Create',
          description: 'Create a New Template'
        },
        delete: {
          title: 'Delete',
          description: 'Delete Selected Template'
        }
      }
    }
    /* return {
      elemsGetter: 'elems',
      depsGetter: 'deps',
      actionNames: {
        newNode: 'newNode',
        editNode: 'editNode',
        deleteNode: 'deleteNode',
        newDep: 'newDep',
        deleteDep: 'deleteDep'
      }
    } */
    // TODO Получить из хранилища объект пользователя и получить его шаблоны, состоящие из узлов и зависимостей
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
    }
  },
  computed: {
    temps () {
      // источник данных о шаблонах
      return this.$store.getters.temps
    },
    checkTemplate () {
      // Проверка: есть ли выделенный шаблон в списке
      return this.selectedTempId !== null
    }
  },
  /* watch: {
    // Если изменился список
    temps (newVal, oldVal) {
      newVal.forEach(t => {
        console.log(t)
      })
    }
  }, */
  methods: {
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
      console.log('addTempClick')
      this.formMode = 'create'
      this.tempCreateDialogHandler = uiMessage(this.tempCreateDialogItOk, this.tempCreateDialogItCancel)
      this.tempCreateDialogHandler.call()
    },
    editTempClick () {
      console.log('editTempClick')
    },
    delTempClick () {
      console.log('delTempClick')
      this.formMode = 'delete'
      this.tempDeleteDialogHandler = uiMessage(this.tempDeleteDialogItOk, this.tempDeleteDialogItCancel)
      this.tempDeleteDialogHandler.call()
    },
    importTempClick () {
      console.log('importTempClick')
    },
    useTempClick () {
      console.log('useTempClick')
    },
    tempCreateDialogItOk () {
      // Вызываем в хранилище действие создания шаблона
      console.log('tempCreateDialogItOk')
      this.$store.dispatch('newTemplate', {
        title: this.selectedTemplate.title,
        description: this.selectedTemplate.description,
        access: this.selectedTemplate.access
      })
        .then(() => {
          this.tempCreateDialogHandler = null
          showMessage('#doneMessage')
        })
    },
    tempCreateDialogItCancel () {
      // Вызываем в хранилище действие удаления выделенного узла
      console.log('tempCreateDialogItCancel')
      this.tempCreateDialogHandler = null
      showMessage('#cancelledMessage')
    },
    tempDeleteDialogItOk () {
      // Вызываем в хранилище действие создания шаблона
      console.log('tempDeleteDialogItOk')
      // Вызываем в хранилище действие удаления выделенного узла
      this.$store.dispatch('deleteTemplate', this.selectedTempId)
        .then(() => {
          this.tempDeleteDialogHandler = null
          showMessage('#doneMessage')
        })
    },
    tempDeleteDialogItCancel () {
      // Вызываем в хранилище действие удаления выделенного узла
      console.log('tempDeleteDialogItCancel')
      this.tempDeleteDialogHandler = null
      showMessage('#cancelledMessage')
    },
    // Метод сброса состояния формы создания/редактирования узла
    resetTempForm () {
      this.selectedTemplate = {
        title: '',
        description: '',
        access: false
      }
      this.tempFormMode = ''
    },
    // Метод установки выбранного шаблона
    // для дальнейшего редактирования в форме
    setTempForm () {
      if (this.checkTemplate) {
        this.selectedTemplate = this.temps.find(temp => temp.id === this.selectedTempId)
      }
    },
    templatesItemClick (id) {
      console.log('templatesItemClick: ' + id)
      this.selectedTempId = id
    }
  }
}
</script>

<style lang="stylus" scoped>
  .templates-actions-button
    margin 5px
  .templates-item
    padding-left 10px
    &.selected
      background-color #CCC
      font-weight bold
  /* .task-item
    margin-bottom 20px
    .ui-checkbox:checked:before
      border-color #909399
    &.completed
      .ui-title-2,
      .ui-text-regular,
      .ui-tag
        text-decoration line-through
        color #909399
    &:last-child
      margin-bottom 0 */
</style>
