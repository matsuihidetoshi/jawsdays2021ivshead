<template>
  <v-row>
    <v-col
      v-if="primaryStream"
      cols="12"
      sm="9"
    >
      <item
        :stream="primaryStream"
        :timestamp="timestamp"
        :index="0"
      />
    </v-col>

    <v-col
      cols="12"
      sm="3"
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
          <v-list-item
            v-for="(link, key) in links"
            :key="key"
          >
            <a
              class="text-truncate"
              :href="link.to"
              target="_blank"
            >
              <v-icon
                v-if="link.icon"
                class="mb-1"
                v-text="link.icon"
              />
              {{ link.text }}
            </a>
          </v-list-item>
        </v-list>
      </v-card>
    </v-col>

    <v-col
      v-for="(stream, index) in otherStreams"
      :key="index"
      cols="12"
      sm="6"
    >
      <item
        :stream="stream"
        :timestamp="timestamp"
        :index="index + 1"
        @finish="loading = false"
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
import links from '~/data/links.json'

@Component({
  components: {
    Item
  },
  data () {
    return {
      links,
      streams: [],
      primaryStream: null,
      otherStreams: [],
      layouts: [8, 4, 4, 6, 6, 6],
      loading: true,
      interval: null,
      timestamp: new Date().getTime()
    }
  },
  mounted () {
    this.fetchStreams()
    if (navigator.userAgent.indexOf('iPhone') > 0) {
      this.interval = setInterval(() => {
        this.updateStreams()
      }, 60000)
    }
  },
  beforeDestroy () {
    clearInterval(this.interval)
  },
  methods: {
    async fetchStreams () {
      const response = await this.$axios.$get('https://xus4jptq21.execute-api.ap-northeast-1.amazonaws.com/default/jawsdays2021getStreamData')
      this.streams = response.body
      this.otherStreams = Array.from(this.streams)
      this.primaryStream = this.otherStreams.shift()
    },
    async updateStreams () {
      const response = await this.$axios.$get(
        'https://xus4jptq21.execute-api.ap-northeast-1.amazonaws.com/default/jawsdays2021getStreamData',
        { progress: false }
      )
      this.streams = response.body
      this.otherStreams = Array.from(this.streams)
      this.primaryStream = this.otherStreams.shift()
    }
  }
})

export default class List extends Vue { }
</script>
<style scoped>
a {
  text-decoration: none;
}
</style>
