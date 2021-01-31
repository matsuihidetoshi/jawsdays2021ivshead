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

    <v-card-text>
      {{ stream.description }}
    </v-card-text>
  </v-card>
</template>

<script>
import { Vue, Component } from 'nuxt-property-decorator'

@Component({
  props: {
    stream: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      timestamp: new Date().getTime()
    }
  },
  mounted () {
    this.startStream(this.stream)
  },
  methods: {
    startStream (stream) {
      const script = document.createElement('script')
      script.innerHTML = `
        if (typeof player === 'undefined') {
          registerIVSTech(videojs)
          registerIVSQualityPlugin(videojs)
          const player = videojs('video-player-${this.timestamp}', {
              techOrder: ["AmazonIVS"]
          })
          player.enableIVSQualityPlugin()
          player.src("${stream.url}")
        }
      `
      document.body.appendChild(script)
    },
    hide (active) {
      if (active) {
        return 'block'
      } else {
        return 'none'
      }
    }
  }
})

export default class Detail extends Vue { }
</script>
