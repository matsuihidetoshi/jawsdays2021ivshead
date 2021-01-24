<template>
  <v-row>
    <v-col
      cols="12"
      md="8"
    >
      <item
        v-if="primaryStream"
        :stream="primaryStream"
        :index="1"
      />
    </v-col>

    <v-col
      cols="12"
      md="4"
    >
      <v-row>
        <v-col
          v-for="(sideStream, sideIndex) in sideStreams"
          :key="sideIndex"
          cols="12"
          class="pt-0"
        >
          <item
            v-if="sideStream"
            :stream="sideStream"
            :index="sideIndex + 2"
          />
        </v-col>
      </v-row>
    </v-col>

    <v-col
      v-for="(bottomStream, bottomIndex) in bottomStreams"
      :key="bottomIndex"
      cols="12"
      md="6"
      class="pt-0"
    >
      <item
        v-if="bottomStream"
        :stream="bottomStream"
        :index="bottomIndex + 4"
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
      sideStreams: [],
      bottomStreams: [],
      layouts: [8, 4, 4, 6, 6, 6],
      loading: true,
      interval: null
    }
  },
  mounted () {
    this.fetchStreams().then(() => {
      this.startStream(this.primaryStream, 1)
      this.sideStreams.forEach((stream, index) => {
        this.startStream(stream, index + 2)
      })
      this.bottomStreams.forEach((stream, index) => {
        this.startStream(stream, index + 4)
      })
      this.loading = false
    })
    /* this.interval = setInterval(() => {
      this.updateStreams()
    }, 5000) */
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
      this.primaryStream = this.streams.shift()
      this.sideStreams.push(this.streams.shift())
      this.sideStreams.push(this.streams.shift())
      this.bottomStreams.push(this.streams.shift())
      this.bottomStreams.push(this.streams.shift())
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
        }
      })
    }
  }
})

export default class List extends Vue { }
</script>
