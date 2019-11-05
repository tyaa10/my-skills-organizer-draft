<template lang="pug">
.wrapper
  section
    .container
      h1.ui-title-1 Templates
    .container
      Experimental(:elems-getter="elemsGetter", :deps-getter="depsGetter", :action-names="actionNames")
  .sidebar-open-button#templatesSidebarOpenButton(@click='toggleTemplatesSidebar')
    .button-burger
      span.line.line-1
      span.line.line-2
      span.line.line-3
  .right-sidebar
    .container
      .sidebar-content
        .sidebar-list
          .sidebar-item Hello
          .sidebar-item World
          .sidebar-item !
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
      templatesSidebarShown: true
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
    // TODO Получить из хранилища объект пользователя и получить его узлы и зависимости
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
    }
  }
}
</script>

<style lang="stylus" scoped></style>
