<template lang="pug">
.wrapper
  section
    .container
      h1.ui-title-1 Templates
    .container
      FabricCanvas(:elemsGetter="elemsGetter")
</template>
<script>
import FabricCanvas from '@/components/FabricCanvas.vue'
export default {
  components: {
    FabricCanvas
  },
  data () {
    return {
      elemsGetter: this.$store.getters.elems/* ,
      templateElemsGetter: this.$store.getters.templateElems */
    }
  }
}
</script>

<style lang="stylus" scoped></style>
