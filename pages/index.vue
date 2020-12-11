<template>
  <div>
    <player-index />
  </div>
</template>

<script>
import { Component, Vue } from 'nuxt-property-decorator'
import PlayerIndex from '~/components/streams/Index.vue'

@Component({
  components: {
    PlayerIndex
  }
})

export default class Index extends Vue { }
</script>
