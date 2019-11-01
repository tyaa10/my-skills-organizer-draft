<template lang="pug">
.wrapper
  section
    .container
      h1.ui-title-1 Templates
    .container
      Experimental(:elems-getter="elemsGetter", :deps-getter="depsGetter", :action-names="actionNames")
</template>
<script>
import Experimental from '@/components/Experimental.vue'
export default {
  components: {
    Experimental
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

<style lang="stylus" scoped></style>
