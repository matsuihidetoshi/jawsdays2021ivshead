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

    <v-card-title
      v-if="question"
      class="font-weight-bold"
    >
      投票！
    </v-card-title>

    <question
      v-if="question"
      :options="options"
      :action="postAnswer"
      @finish-post="finishPost()"
    />

    <v-snackbar
      v-model="snackbar"
      color="#FF4081"
      top
    >
      <span
        class="font-weight-bold"
      >
        {{ message }}
      </span>
      <template v-slot:action="{ attrs }">
        <v-btn
          text
          v-bind="attrs"
          @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>

    <v-overlay
      :value="loading"
    >
      <v-progress-circular
        indeterminate
        :size="80"
        :width="10"
      />
    </v-overlay>
  </v-card>
</template>

<script>
import { Vue, Component } from 'nuxt-property-decorator'
import videojs from 'video.js'
import Question from '~/components/streams/Question.vue'

let ivs = null

@Component({
  components: {
    Question
  },
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
      interval: null,
      question: false,
      result: false,
      options: [
        { text: '1', color: '#FF4081' },
        { text: '2', color: '#448AFF' },
        { text: '3', color: '#FFAB40' },
        { text: '4', color: '#43A047' }
      ],
      message: '',
      snackbar: false,
      loading: false,
      value: null
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
    startStream (stream) {
      const player = videojs(`video-player-${this.timestamp}`, {
        techOrder: ['AmazonIVS']
      })
      player.enableIVSQualityPlugin()
      const playerEvent = player.getIVSEvents().PlayerEventType
      player.getIVSPlayer().addEventListener(playerEvent.TEXT_METADATA_CUE, (cue) => {
        const event = cue.text.split(':')[0]
        if (event === 'Q') {
          this.message = '↓下から投票してください！↓'
          this.snackbar = true
          this.question = true
        }
      })
      player.src(stream.url)
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
    },
    async postAnswer (number) {
      this.loading = true
      await console.log('Post: ' + number)
      this.loading = false
    },
    finishPost () {
      this.question = false
      this.message = '投票しました！'
      this.snackbar = true
    }
  }
})

export default class Detail extends Vue { }
</script>
