<template>
  <stream-detail :stream="stream" />
</template>

<script>
import { Vue, Component } from 'nuxt-property-decorator'
import streams from '~/data/streams.json'
import StreamDetail from '~/components/streams/Detail.vue'

@Component({
  components: {
    StreamDetail
  },
  data () {
    return {
      streams,
      stream: null
    }
  },
  created () {
    this.getStreamById()
  },
  methods: {
    getStreamById () {
      this.stream = streams.find(stream => stream.name === this.$route.params.id)
    }
  }
})

export default class Id extends Vue { }
</script>
