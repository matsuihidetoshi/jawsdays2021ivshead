<template>
  <v-card
    :to="'/' + stream.slug"
  >
    <video
      :id="
        'video-player-' + index + '-' + timestamp
      "
      class="video-js vjs-fluid vjs-big-play-centered"
      width="100%"
      controls
      playsinline
      autoplay
      muted
      :style="'display: ' + hide(stream.active)"
    />

    <v-card-title
      class="text-truncate"
    >
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
import { Component, Vue } from 'nuxt-property-decorator'

@Component({
  props: {
    stream: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    timestamp: {
      type: Number,
      required: true
    }
  },
  methods: {
    hide (active) {
      if (active) {
        return 'block'
      } else {
        return 'none'
      }
    }
  }
})

export default class Item extends Vue { }
</script>
