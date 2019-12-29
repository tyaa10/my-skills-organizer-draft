<template lang='pug'>
.content-wrapper
  section
    .container
      h1.ui-title-1 {{$t('home.header')}}
      div
        span.ui-square.color-new
        = ' '
        span {{$t('home.marking.new')}}
        = ' '
        span.ui-square.color-scheduled
        = ' '
        span {{$t('home.marking.scheduled_not_satisfied')}}
        = ' '
        span.ui-square.color-scheduled-deps-satisfied
        = ' '
        span {{$t('home.marking.scheduled_satisfied')}}
      = ' '
      div
        span.ui-square.color-started
        = ' '
        span {{$t('home.marking.started')}}
        = ' '
        span.ui-square.color-suspended
        = ' '
        span {{$t('home.marking.suspended')}}
        = ' '
        span.ui-square.color-cancelled
        = ' '
        span {{$t('home.marking.cancelled')}}
        = ' '
        span.ui-square.color-done
        = ' '
        span {{$t('home.marking.done')}}
  // Секция, содержащая экземпляр пользовательского компонента FabricCanvas
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
