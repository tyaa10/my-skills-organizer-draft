<template lang="pug">
.wrapper
  section
    .container
      h1.ui-title-1 FabricCanvas
    .container
      p Elems count: {{elemsGetter.length}}
</template>
<script>
export default {
  props: ['elemsGetter'],
  data () {
    return {}
  }
}
</script>

<style lang="stylus" scoped></style>
