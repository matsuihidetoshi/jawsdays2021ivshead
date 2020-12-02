<template>
  <div>
    <player-index :streams="streams" />
  </div>
</template>

<script>
import { Component, Vue } from 'nuxt-property-decorator'
import streams from '~/data/streams.json'
import PlayerIndex from '~/components/players/Index.vue'

@Component({
  components: {
    PlayerIndex
  },
  data () {
    return {
      streams
    }
  }
})

export default class Index extends Vue { }
</script>
