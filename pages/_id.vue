<template>
  <stream-detail
    v-if="stream"
    :stream="stream"
  />
</template>

<script>
import { Vue, Component } from 'nuxt-property-decorator'
import StreamDetail from '~/components/streams/Detail.vue'

@Component({
  components: {
    StreamDetail
  },
  data () {
    return {
      stream: null
    }
  },
  created () {
    this.getStreamById()
  },
  methods: {
    async getStreamById () {
      const streams = await this.$axios.$get('https://jieauj14v9.execute-api.ap-northeast-1.amazonaws.com/default/getStreamData')
      this.stream = streams.body.find(stream => stream.id === this.$route.params.id)
    }
  }
})

export default class Id extends Vue { }
</script>
