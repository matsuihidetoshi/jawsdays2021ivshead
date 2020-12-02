<template>
  <v-btn
    v-if="position > 200"
    fab
    dark
    fixed
    bottom
    right
    color="primary"
    @click="$vuetify.goTo(0)"
  >
    <v-icon>mdi-apple-keyboard-control</v-icon>
  </v-btn>
</template>
<script>
import { Component, Vue } from 'nuxt-property-decorator'

@Component({
  data () {
    return {
      position: 0
    }
  },
  mounted () {
    window.addEventListener('scroll', this.onScroll)
  },
  destroyed () {
    window.removeEventListener('scroll', this.onScroll)
  },
  methods: {
    onScroll () {
      this.position = window.scrollY
    }
  }
})

export default class ScrollButton extends Vue { }
</script>
