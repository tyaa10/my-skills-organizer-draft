<template lang="pug">
.wrapper
  section
    .container
      h1.ui-title-1 {{$t('about.about')}}
      p {{$t('about.description_p1')}}
      p {{$t('about.description_p2')}}
      p {{$t('about.description_p3')}}
      p
        strong {{$t('about.description_p4')}}
</template>
<script>
export default {
  data () {
    return {}
  }
}
</script>

<style lang="stylus" scoped></style>
