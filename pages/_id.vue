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
      stream: null,
      interval: null
    }
  },
  mounted () {
    this.getStreamById().then(() => {
      this.interval = setInterval(() => {
        this.updateStream()
      }, 60000)
    })
  },
  beforeDestroy () {
    clearInterval(this.interval)
  },
  methods: {
    async getStreamById () {
      const response = await this.$axios.$get('https://xus4jptq21.execute-api.ap-northeast-1.amazonaws.com/default/jawsdays2021getStreamData')
      this.stream = response.body.find(stream => stream.slug === this.$route.params.id)
    },
    async updateStream () {
      const response = await this.$axios.$get(
        'https://xus4jptq21.execute-api.ap-northeast-1.amazonaws.com/default/jawsdays2021getStreamData',
        { progress: false }
      )
      const stream = response.body.find(stream => stream.slug === this.$route.params.id)
      if (
        (this.stream.title !== stream.title) ||
        (this.stream.description !== stream.description) ||
        (this.stream.active !== stream.active)
      ) {
        this.stream.title = stream.title
        this.stream.description = stream.description
        this.stream.active = stream.active
      }
    }
  }
})

export default class Id extends Vue { }
</script>
