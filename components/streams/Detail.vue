<template>
  <v-card>
    <video
      :id="
        'video-player-' + stream.id
      "
      width="100%"
      controls
      playsinline
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
  mounted () {
    this.startStream(this.stream)
  },
  methods: {
    startStream (stream) {
      const script = document.createElement('script')
      script.innerHTML = `
        if (typeof player === 'undefined') {
          const player = IVSPlayer.create()
          player.attachHTMLVideoElement(document.getElementById('video-player-${stream.id}'))
          player.load("${stream.url}")
          player.play()
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
