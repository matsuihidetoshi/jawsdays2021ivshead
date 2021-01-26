<template>
  <v-row>
    <v-col
      v-if="primaryStream"
      cols="12"
      md="9"
    >
      <item
        :stream="primaryStream"
        :index="0"
      />
    </v-col>

    <v-col
      cols="12"
      md="3"
    >
      <v-card
        flat
      >
        <a
          href="https://jawsdays2021.jaws-ug.jp/"
          target="_blank"
        >
          <v-img
            src="/jaws-days-2021-online.png"
          />
        </a>

        <v-list
          class="overflow-y-auto"
        >
          <v-list-item>
            <a
              href="https://twitter.com/jawsdays"
              target="_blank"
            >
              JAWS-DAYS 2021 re:Connect
            </a>
          </v-list-item>

          <v-list-item>
            <a
              href="https://note.com/jawsdays2021/"
              target="_blank"
            >
              note
            </a>
          </v-list-item>

          <v-list-item>
            <a
              href="https://jaws-ug.jp/"
              target="_blank"
            >
              JAWS-UG 公式サイト
            </a>
          </v-list-item>

          <v-list-item>
            <a
              href="https://www.facebook.com/jawsug/"
              target="_blank"
            >
              <v-icon
                class="mb-1"
              >
                mdi-facebook
              </v-icon>
              Facebook
            </a>
          </v-list-item>

          <v-list-item>
            <a
              href="https://www.facebook.com/jawsug/"
              target="_blank"
            >
              <v-icon
                class="mb-1"
              >
                mdi-twitter
              </v-icon>
              Twitter
            </a>
          </v-list-item>
        </v-list>
      </v-card>
    </v-col>

    <v-col
      v-for="(stream, index) in otherStreams"
      :key="index"
      cols="12"
      md="6"
    >
      <item
        :stream="stream"
        :index="index + 1"
      />
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
import Item from '~/components/streams/Item.vue'

@Component({
  components: {
    Item
  },
  data () {
    return {
      streams: [],
      primaryStream: null,
      otherStreams: [],
      layouts: [8, 4, 4, 6, 6, 6],
      loading: true,
      interval: null
    }
  },
  mounted () {
    this.fetchStreams().then(() => {
      this.startStream(this.primaryStream, 0)
      this.otherStreams.forEach((stream, index) => {
        this.startStream(stream, index + 1)
      })
      this.loading = false
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
      const response = await this.$axios.$get('https://xus4jptq21.execute-api.ap-northeast-1.amazonaws.com/default/jawsdays2021getStreamData')
      this.streams = response.body
      this.otherStreams = Array.from(this.streams)
      this.primaryStream = this.otherStreams.shift()
    },
    async updateStreams () {
      const streams = await this.$axios.$get(
        'https://xus4jptq21.execute-api.ap-northeast-1.amazonaws.com/default/jawsdays2021getStreamData',
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
          this.otherStreams = Array.from(this.streams)
          this.primaryStream = this.otherStreams.shift()
        }
      })
    }
  }
})

export default class List extends Vue { }
</script>
<style scoped>
a {
  text-decoration: none;
}
.overflow-y-scroll {

}
</style>
