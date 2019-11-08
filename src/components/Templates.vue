<template lang="pug">
.wrapper
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
        .button.button-default.templates-actions-button(@click='editTempClick') e
        .button.button-default.templates-actions-button(@click='delTempClick') d
        .button.button-default.templates-actions-button(@click='useTempClick') u
        .sidebar-list
          transition-group
            .sidebar-item(
              v-for="temp in temps"
              :key="temp.id"
              :class="{ public: temp.access, selected: (selectedTempId === temp.id) }"
            )
              p.ui-text-regular {{ temp.title }}
</template>
<script>
import { showRightSidebar, hideRightSidebar } from '@/assets/js/uimini.js'
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
        newDep: 'newDep',
        deleteDep: 'deleteDep'
      },
      templatesSidebarShown: true,
      selectedTempId: null
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
  computed: {
    temps () {
      // источник данных о шаблонах
      return this.$store.getters.temps
    }
  },
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
    },
    editTempClick () {
      console.log('editTempClick')
    },
    delTempClick () {
      console.log('delTempClick')
    },
    importTempClick () {
      console.log('importTempClick')
    },
    useTempClick () {
      console.log('useTempClick')
    }
  }
}
</script>

<style lang="stylus" scoped>
  .templates-actions-button
    margin 5px
  .task-item
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
      margin-bottom 0
</style>
