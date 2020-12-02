<template>
  <v-card>
    <video
      :id="
        'video-player-' + stream.name
      "
      width="100%"
      controls
      playsinline
    />

    <v-card-text>
      {{ stream.url }}
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
        var player = IVSPlayer.create()
        player.attachHTMLVideoElement(document.getElementById('video-player-${stream.name}'))
        player.load("${stream.url}")
        player.play()
      `
      document.body.appendChild(script)
    }
  }
})

export default class Detail extends Vue { }
</script>
