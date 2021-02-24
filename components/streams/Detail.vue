<template>
  <v-card>
    <video
      :id="
        'video-player-' + timestamp
      "
      class="video-js vjs-fluid vjs-big-play-centered"
      width="100%"
      controls
      playsinline
      autoplay
      :style="'display: ' + hide(stream.active)"
    />

    <v-card-title>
      {{ stream.title }}
      <span
        v-if="!stream.active"
      >
        （準備中）
      </span>
    </v-card-title>

    <v-chip
      v-if="viewer"
      color="secondary"
      class="
        float-right
        mr-3
        font-weight-bold
      "
    >
      {{ viewer.count.slice(-1)[0] }} Viewers
    </v-chip>

    <v-card-text
      style="white-space:pre-line"
    >
      {{ stream.description }}
    </v-card-text>
  </v-card>
</template>

<script>
import { Vue, Component } from 'nuxt-property-decorator'
import videojs from 'video.js'

let ivs = null

@Component({
  props: {
    stream: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      timestamp: new Date().getTime(),
      viewers: [],
      viewer: null,
      interval: null
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

    this.startStream(this.stream)
    this.getViewers().then(() => {
      this.findViewer()
    })
    this.interval = setInterval(() => {
      this.getViewers().then(() => {
        this.findViewer()
      })
    }, 60000)
  },
  beforeDestroy () {
    clearInterval(this.interval)
  },
  methods: {
    startStream () {
      const player = videojs(`video-player-${this.timestamp}`, {
        techOrder: ['AmazonIVS']
      })
      player.enableIVSQualityPlugin()
      player.src('https://fcc3ddae59ed.us-west-2.playback.live-video.net/api/video/v1/us-west-2.893648527354.channel.xhP3ExfcX8ON.m3u8')
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
      }
    }
  }
})

export default class Detail extends Vue { }
</script>
