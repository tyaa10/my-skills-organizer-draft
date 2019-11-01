<template lang="pug">
.wrapper
  section
    .container
      h1.ui-title-1 FabricCanvas
    .container
      p Elems count: {{this.$store.getters[this.elemsGetter].length}}
      p Deps count: {{this.$store.getters[this.depsGetter].length}}
      p Actions count: {{Object.keys(actionNames).length}}
</template>
<script>
export default {
  props: ['elemsGetter', 'depsGetter', 'actionNames'],
  data () {
    return {}
  },
  computed: {
    elems () {
      console.log(this.elemsGetter)
      return this.elemsGetter
    }
  }
}
</script>

<style lang="stylus" scoped></style>
