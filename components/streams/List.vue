<template>
  <v-row>
    <v-col
      v-for="(stream, index) in streams"
      :key="index"
      cols="12"
      :md="6"
    >
      <item
        :stream="stream"
        :index="index"
      />
    </v-col>

    <v-overlay
      :value="loading"
    >
      <v-progress-circular
        indeterminate
        :size="80"
        :width="10"
      />
    </v-overlay>
  </v-row>
</template>

<script>
import { Component, Vue } from 'nuxt-property-decorator'
import Item from '~/components/streams/Item.vue'

@Component({
  components: {
    Item
  },
  data () {
    return {
      streams: [],
      primaryStream: null,
      sideStreams: [],
      bottomStreams: [],
      layouts: [8, 4, 4, 6, 6, 6],
      loading: true,
      interval: null
    }
  },
  mounted () {
    this.fetchStreams().then(() => {
      this.streams.forEach((stream, index) => {
        this.startStream(stream, index)
        this.loading = false
      })
    })
    this.interval = setInterval(() => {
      this.updateStreams()
    }, 5000)
  },
  beforeDestroy () {
    clearInterval(this.interval)
  },
  methods: {
    startStream (stream, index) {
      const script = document.createElement('script')
      script.setAttribute('id', 'player-script-' + index)
      script.innerHTML = `
        if (typeof player${index} === 'undefined') {
          const player${index} = IVSPlayer.create()
          player${index}.attachHTMLVideoElement(document.getElementById('video-player-${index}'))
          player${index}.load("${stream.url}")
          player${index}.play()
        }
      `
      document.body.appendChild(script)
    },
    async fetchStreams () {
      const response = await this.$axios.$get('https://xus4jptq21.execute-api.ap-northeast-1.amazonaws.com/default/jawsdays2021getStreamData')
      this.streams = response.body
    },
    async updateStreams () {
      const streams = await this.$axios.$get(
        'https://xus4jptq21.execute-api.ap-northeast-1.amazonaws.com/default/jawsdays2021getStreamData',
        { progress: false }
      )
      streams.body.forEach((stream, index) => {
        if (
          (this.streams[index].title !== stream.title) ||
          (this.streams[index].description !== stream.description) ||
          (this.streams[index].active !== stream.active)
        ) {
          this.streams[index].title = stream.title
          this.streams[index].description = stream.description
          this.streams[index].active = stream.active
        }
      })
    }
  }
})

export default class List extends Vue { }
</script>
