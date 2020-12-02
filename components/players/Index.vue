<template>
  <v-row>
    <v-col
      v-for="(stream, index) in streams"
      :key="index"
      cols="12"
      md="6"
    >
      <v-card>
        <video :id="'video-player-' + index" width="100%" controls playsinline />

        <v-card-text>
          {{ stream.url }}
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { Component, Vue } from 'nuxt-property-decorator'

@Component({
  props: {
    streams: {
      type: Array,
      required: true
    }
  },
  mounted () {
    this.readIVSScript().then(() => {
      this.streams.forEach((stream, index) => {
        this.startStream(stream, index)
      })
    })
  },
  methods: {
    async readIVSScript () {
      const readScript = document.createElement('script')
      readScript.src = 'https://player.live-video.net/1.0.0/amazon-ivs-player.min.js'
      readScript.async = true
      await document.body.appendChild(readScript)
      return readScript
    },
    startStream (stream, index) {
      const script = document.createElement('script')
      script.innerHTML = `
        var player = IVSPlayer.create()
        player.attachHTMLVideoElement(document.getElementById('video-player-${index}'))
        player.load("${stream.url}")
        player.play()
      `
      document.body.appendChild(script)
    }
  }
})

export default class Index extends Vue { }
</script>
