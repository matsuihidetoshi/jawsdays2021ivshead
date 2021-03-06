<template>
  <v-card
    :to="'/' + stream.slug"
  >
    <video
      :id="
        'video-player-' + index + '-' + timestamp
      "
      class="video-js vjs-fluid vjs-big-play-centered"
      width="100%"
      controls
      playsinline
      autoplay
      muted
      :style="'display: ' + hide(stream.active)"
    />

    <v-card-title>
      <span
        class="text-truncate"
      >
        {{ title }}
      </span>

      <span
        v-if="!stream.active"
      >
        （準備中）
      </span>
    </v-card-title>

    <v-chip
      v-if="viewer"
      :color="exciting ? 'error' : 'secondary'"
      class="
        float-right
        mr-3
        font-weight-bold
      "
    >
      {{ viewer.count.slice(-1)[0] }} Viewers
      <v-icon
        v-if="exciting"
        class="ml-3"
      >
        mdi-arrow-up-bold-circle-outline
      </v-icon>
    </v-chip>

    <v-card-text
      style="white-space:pre-line"
    >
      {{ description }}
    </v-card-text>
  </v-card>
</template>
<script>
import { Component, Vue } from 'nuxt-property-decorator'
import videojs from 'video.js'

let ivs = null

@Component({
  props: {
    stream: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    timestamp: {
      type: Number,
      required: true
    }
  },
  data () {
    return {
      player: null,
      viewers: [],
      viewer: null,
      interval: null,
      title: this.stream.title || '',
      description: this.stream.description || '',
      descriptionBuffer: '',
      updateKey: ''
    }
  },
  computed: {
    computedStream () {
      return this.stream
    }
  },
  watch: {
    computedStream () {
      this.title = this.computedStream.title
      this.description = this.computedStream.description
    }
  },
  mounted () {
    if (ivs === null) {
      ivs = require('amazon-ivs-player')
      ivs.registerIVSTech(videojs, {
        wasmBinary: '/_nuxt/amazon-ivs-wasmworker.min.wasm',
        wasmWorker: '/_nuxt/amazon-ivs-wasmworker.min.js'
      })
      ivs.registerIVSQualityPlugin(videojs)
    }
    this.startStream(this.stream, this.index)
    this.getViewers().then(() => {
      this.findViewer()
    })
    if (navigator.userAgent.indexOf('iPhone') > 0) {
      this.interval = setInterval(() => {
        this.getViewers().then(() => {
          this.findViewer()
        })
      }, 60000)
    }
  },
  beforeDestroy () {
    clearInterval(this.interval)
    this.stopStream()
  },
  methods: {
    startStream (stream, index) {
      this.player = videojs(`video-player-${index}-${this.timestamp}`, {
        techOrder: ['AmazonIVS']
      })
      this.player.enableIVSQualityPlugin()
      const playerEvent = this.player.getIVSEvents().PlayerEventType
      this.player.getIVSPlayer().addEventListener(playerEvent.TEXT_METADATA_CUE, (cue) => {
        const event = cue.text.split(':')[0]
        if (event === 'V') {
          const viewers = JSON.parse(cue.text.split('::')[1])
          this.viewer = {
            key: viewers[0].channel.split('/')[1],
            count: [
              viewers[4].count,
              viewers[3].count,
              viewers[2].count,
              viewers[1].count,
              viewers[0].count
            ]
          }
          if (this.viewer.count[0] < this.viewer.count[4]) {
            this.exciting = true
          } else {
            this.exciting = false
          }
        } else if (event === 'D') {
          if (cue.text.split('::')[4] && cue.text.split('::')[4] === 'START') {
            this.updateKey = cue.text.split('::')[2]
            this.descriptionBuffer = cue.text.split('::')[3]
          } else if (!cue.text.split('::')[4] && cue.text.split('::')[2] === this.updateKey) {
            this.descriptionBuffer += cue.text.split('::')[3]
          } else if (cue.text.split('::')[4] && cue.text.split('::')[4] === 'END') {
            this.description = this.descriptionBuffer + cue.text.split('::')[3]
            this.descriptionBuffer = ''
          }
        } else if (event === 'T') {
          this.title = cue.text.split('::')[1]
        }
      })
      this.player.src(stream.url)
      this.$emit('finish')
    },
    stopStream () {
      this.player.pause()
      this.player.src('')
    },
    hide (active) {
      if (active) {
        return 'block'
      } else {
        return 'none'
      }
    },
    async getViewers () {
      const response = await this.$axios.$get('https://fthtzlhqci.execute-api.ap-northeast-1.amazonaws.com/default/jawsdays2021getIVSViewerCount')
      const viewerDataArray = response.body
      this.viewers = viewerDataArray.map((viewerData) => {
        if (viewerData.length > 0) {
          return {
            key: viewerData[0].channel.split('/')[1],
            count: viewerData.sort((a, b) => {
              return a.time - b.time
            }).map((data) => {
              return data.count
            })
          }
        } else {
          return null
        }
      })
    },
    findViewer () {
      if (this.viewers.length === 0) {
        this.viewer = null
      } else {
        this.viewer = this.viewers.find((viewer) => {
          return viewer ? this.stream.url.split('.')[7] === viewer.key : null
        })
        if (this.viewer.count[0] < this.viewer.count[4]) {
          this.exciting = true
        } else {
          this.exciting = false
        }
      }
    }
  }
})

export default class Item extends Vue { }
</script>
