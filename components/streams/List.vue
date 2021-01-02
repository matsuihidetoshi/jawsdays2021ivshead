<template>
  <v-row>
    <v-col
      v-for="(stream, index) in streams"
      :key="index"
      cols="12"
      md="6"
    >
      <v-card
        :to="'/' + stream.id"
      >
        <video
          :id="
            'video-player-' + index
          "
          width="100%"
          controls
          playsinline
          muted
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

@Component({
  data () {
    return {
      streams: [],
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
      const response = await this.$axios.$get('https://jieauj14v9.execute-api.ap-northeast-1.amazonaws.com/default/getStreamData')
      this.streams = response.body
    },
    async updateStreams () {
      const streams = await this.$axios.$get(
        'https://jieauj14v9.execute-api.ap-northeast-1.amazonaws.com/default/getStreamData',
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

export default class List extends Vue { }
</script>
