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

    <result
      :result="chartData"
      :options="chartOptions"
      :display="resultDisplay"
      @back="resultDisplay = false"
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
import AWS from 'aws-sdk'
import videojs from 'video.js'
import Question from '~/components/streams/Question.vue'
import Result from '~/components/streams/Result.vue'

let ivs = null

const TABLENAME = process.env.surveysTableName

AWS.config.update({
  region: process.env.awsRegion,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: process.env.awsIdPoolId
  })
})

const docClient = new AWS.DynamoDB.DocumentClient()

@Component({
  components: {
    Question,
    Result
  },
  props: {
    stream: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      player: null,
      timestamp: new Date().getTime(),
      viewers: [],
      viewer: null,
      interval: null,
      question: false,
      resultDisplay: false,
      chartDataValues: [],
      chartColors: [
        '#FF4081',
        '#448AFF',
        '#FFAB40',
        '#43A047'
      ],
      chartLabels: ['1', '2', '3', '4'],
      chartOptions: {
        animation: {
          duration: 1500,
          easing: 'easeInOutCubic'
        }
      },
      options: [
        { text: '1', color: '#FF4081' },
        { text: '2', color: '#448AFF' },
        { text: '3', color: '#FFAB40' },
        { text: '4', color: '#43A047' }
      ],
      message: '',
      snackbar: false,
      loading: false,
      value: null,
      questionId: null,
      questionData: null,
      title: this.stream.title || '',
      description: this.stream.description || '',
      descriptionBuffer: '',
      updateKey: '',
      exciting: false
    }
  },
  computed: {
    chartData () {
      return {
        datasets: [
          {
            data: this.chartDataValues,
            backgroundColor: this.chartColors
          }
        ],
        labels: this.chartLabels
      }
    },
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

    this.startStream(this.stream)
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
    startStream (stream) {
      this.player = videojs(`video-player-${this.timestamp}`, {
        techOrder: ['AmazonIVS']
      })
      this.player.enableIVSQualityPlugin()
      const playerEvent = this.player.getIVSEvents().PlayerEventType
      this.player.getIVSPlayer().addEventListener(playerEvent.TEXT_METADATA_CUE, (cue) => {
        const event = cue.text.split(':')[0]
        if (event === 'Q') {
          this.questionId = cue.text.split(':')[1]
          this.message = '↓下から投票してください！↓'
          this.snackbar = true
          this.question = true
        } else if (event === 'R') {
          this.questionId = cue.text.split(':')[1]
          this.question = false
          this.loading = true
          this.questionId = cue.text.split(':')[1]
          this.query(this.questionId).then(() => {
            this.loading = false
            const numbers = [0, 1, 2, 3]
            this.chartDataValues = numbers.map((number) => {
              const result = this.questionData.find((data) => { return data.answer === number })
              if (result) {
                return result.count
              } else {
                return 0
              }
            })
            this.resultDisplay = true
          })
        } else if (event === 'F') {
          this.question = false
          this.resultDisplay = false
        } else if (event === 'V') {
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
    },
    postAnswer (number) {
      this.loading = true
      const params = {
        TableName: TABLENAME,
        Key: {
          id: this.questionId,
          answer: number
        },
        UpdateExpression: 'ADD #count :one',
        ExpressionAttributeNames: {
          '#count': 'count'
        },
        ExpressionAttributeValues: {
          ':one': 1
        }
      }

      return new Promise((resolve, reject) => {
        docClient.update(params, (err, data) => {
          if (err) {
            reject(err)
          } else {
            const counts = [0, 0, 0, 0]
            if (data.Items) {
              data.Items.forEach((item) => {
                counts[item.answer - 1] = item.count
              })
            }
            resolve(counts)
          }
        })
      })
    },
    finishPost () {
      this.loading = false
      this.question = false
      this.message = '投票しました！'
      this.snackbar = true
    },
    query (surveyId) {
      const params = {
        TableName: TABLENAME,
        KeyConditionExpression: '#id = :id',
        ExpressionAttributeNames: {
          '#id': 'id'
        },
        ExpressionAttributeValues: {
          ':id': surveyId
        }
      }

      return new Promise((resolve, reject) => {
        docClient.query(params, (err, data) => {
          if (err) {
            reject(err)
          } else {
            const counts = [0, 0, 0, 0]
            if (data.Items) {
              data.Items.forEach((item) => {
                counts[item.answer - 1] = item.count
              })
            }
            this.questionData = data.Items
            resolve(counts)
          }
        })
      })
    }
  }
})

export default class Detail extends Vue { }
</script>
