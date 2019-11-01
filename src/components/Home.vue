<template lang='pug'>
.content-wrapper
  section
    .container
      h1.ui-title-1 Home - Put your achievements and aims here
      div
        span.ui-square.color-new
        = ' '
        span New
        = ' '
        span.ui-square.color-scheduled
        = ' '
        span Scheduled (some deps are not satisfied)
        = ' '
        span.ui-square.color-scheduled-deps-satisfied
        = ' '
        span Scheduled (no deps or they are satisfied)
      = ' '
      div
        span.ui-square.color-started
        = ' '
        span Started
        = ' '
        span.ui-square.color-suspended
        = ' '
        span Suspended
        = ' '
        span.ui-square.color-cancelled
        = ' '
        span Cancelled
        = ' '
        span.ui-square.color-done
        = ' '
        span Done
  // Секция, содержащая экземпляр компонента Canvas
  // для отображения основного дерева целей и задач
  section#c(ref='canvasContainer')
    FabricCanvas(:elems-getter="elemsGetter", :deps-getter="depsGetter", :action-names="actionNames")
</template>

<script>
import FabricCanvas from '@/components/FabricCanvas.vue'
export default {
  components: {
    FabricCanvas
  },
  data () {
    return {
      elemsGetter: 'elems',
      depsGetter: 'deps',
      actionNames: {
        newNode: 'newNode',
        editNode: 'editNode',
        deleteNode: 'deleteNode',
        newDep: 'newDep',
        deleteDep: 'deleteDep'
      }
    }
  }
}
</script>

<style lang='stylus' scoped></style>
