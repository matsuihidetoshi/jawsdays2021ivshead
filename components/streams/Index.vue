<template>
  <v-row>
    <v-col
      v-for="(stream, index) in streams"
      :key="index"
      cols="12"
      md="6"
    >
      <v-card
        :to="'/' + stream.name"
      >
        <video
          :id="
            'video-player-' + index
          "
          width="100%"
          controls
          playsinline
          muted
        />

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
    this.streams.forEach((stream, index) => {
      this.startStream(stream, index)
    })
  },
  methods: {
    startStream (stream, index) {
      const script = document.createElement('script')
      script.innerHTML = `
        if (typeof player${index} === 'undefined') {
          const player${index} = IVSPlayer.create()
          player${index}.attachHTMLVideoElement(document.getElementById('video-player-${index}'))
          player${index}.load("${stream.url}")
          player${index}.play()
        }
      `
      document.body.appendChild(script)
    }
  }
})

export default class Index extends Vue { }
</script>
