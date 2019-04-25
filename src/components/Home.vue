<template lang='pug'>
.content-wrapper
  section
    .container
      h1.ui-title-1 Home - Put your achievements and aims here
  section#c(ref='canvasContainer')
    Canvas
</template>

<script>
import Canvas from '@/components/Canvas.vue'
export default {
  components: {
    Canvas
  }
}
</script>

<style lang='stylus' scoped></style>
