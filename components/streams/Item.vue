<template>
  <v-card
    :to="'/' + stream.slug"
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

    <v-card-text
      :style="index == 1 ? 'height: 10vw' : ''"
    >
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
